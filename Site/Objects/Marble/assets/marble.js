/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    var TYPE_CIRCLE = 'circle';

    var DEFAULT_GRAVITY = 2; // 0.7;
    var WALL_BOUNCE_COOEFICIENT = 0.70;
    var BALL_BOUNCE_COOEFICIENT = 0.5;

    var RESTITUTION = 3;
    var RENDER_INTERVAL = 30;


    var renderElement = function(e, marble) {
        marble = marble || e.target || this;
        if(marble === document) {
            var marbles = document.getElementsByTagName('marble');
            for(var i=0; i<marbles.length; i++)
                renderElement(e, marbles[i]);
            e.preventDefault();
            return;
        }
        if(!/marble/i.test(marble.nodeName))
            return;

        e.preventDefault();

        var time = new Date();
        var totalElapsedTime = time - (marble.lastRender || new Date());
        if(totalElapsedTime > RENDER_INTERVAL || totalElapsedTime < 0)
            totalElapsedTime = RENDER_INTERVAL;
        marble.lastRender = time;

        var v = getVelocity(marble);
        var a = getAcceleration(marble);
        if(a.x || a.y) {
            v = v.addVector(a.multiply(totalElapsedTime / 1000));
            setVelocity(marble, v);
        }

        var siblings = marble.parentNode.children;
        for(var k=0; k<siblings.length; k++) {
            var sibling = siblings[k];
            if (marble === sibling)
                continue;
            if (sibling.classList.contains(TYPE_CIRCLE))
                testCircleCollision(marble, sibling);
            else if (/marble/i.test(sibling.nodeName))
                testCircleCollision(marble, sibling);
            else
                testCircleRectCollision(marble, sibling);
        }
        testRectContainment(marble, marble.parentNode);

        var p = getPosition(marble);
        p = p.addVector(v);
        setPosition(marble, p);
        render(marble);
    };

    document.addEventListener('render', renderElement);

    var dropElement = function (e, marble) {
        marble = marble || e.target || this;
        if(!/marble/i.test(marble.nodeName))
            return;

        marble.pos = null;
    };

    document.addEventListener('drop-at', dropElement);

    // Physics Methods

    var getArea = function(element) {
        var w = parseInt(element.style.width || element.offsetWidth);
        var h = parseInt(element.style.height || element.offsetHeight);
        return new Vector(w, h);
    };

    var getRect = function(element) {
        var position = getPosition(element);
        var area = getArea(element);
        return new Rect(position.x, position.y, area.x, area.y);
    };

    var getRadius = function(element) {
        var a = getArea(element);
        return a.x > a.y ? a.y / 2 : a.x / 2;
    };

    var getMass = function(element) {
        return getRadius(element);
    };

    var getPosition = function(element) {
        if(element.pos)
            return element.pos;
        var x = parseFloat(element.style.left || element.offsetLeft);
        var y = parseFloat(element.style.top || element.offsetTop);
        return new Vector(x, y);
    };

    var render = function(element) {
        if(element.pos) {
            element.style.left = Math.round(element.pos.x) + 'px';
            element.style.top = Math.round(element.pos.y) + 'px';
            var stats = element.getElementsByClassName('stats-marble');
            if(stats.length === 0) {
                stats[0] = document.createElement('ul');
                element.appendChild(stats[0]);
                stats[0].classList.add('stats');
                stats[0].classList.add('stats-marble');
            }
            var html = "<li><span class='title'>" + element.nodeName + "</span></li>" // element.getAttribute('class')
                + "<li><span class='stat'>x:</span> " + Math.round(element.pos.x) + "</li>"
                + "<li><span class='stat'>y:</span> " + Math.round(element.pos.y) + "</li>";

            if(typeof element.dataset.vx !== 'undefined') {
                html += "<li><span class='stat'>vx:</span> " + Math.round(element.dataset.vx * 10) / 10 + "</li>";
                html += "<li><span class='stat'>vy:</span> " + Math.round(element.dataset.vy * 10) / 10 + "</li>";
            }

            if(typeof element.dataset.ax !== 'undefined') {
                html += "<li><span class='stat'>ax:</span> " + (element.dataset.ax) + "</li>";
                html += "<li><span class='stat'>ay:</span> " + (element.dataset.ay) + "</li>";
            }

            stats[0].innerHTML = html;
        }
    };

    var setPosition = function(element, vector) {
        element.pos = vector;
//         element.style.left = Math.round(vector.x) + 'px';
//         element.style.top = Math.round(vector.y) + 'px';
    };

    var getVelocity = function(element) {
        var vx = parseFloat(element.dataset.vx); // getClassValue(element, 'vx');
        var vy = parseFloat(element.dataset.vy); // getClassValue(element, 'vy');
        return new Vector(vx, vy);
    };

    var setVelocity = function(element, vector) {
        var vx = Math.round(vector.x * 100) / 100;
        var vy = Math.round(vector.y * 100) / 100;
        element.dataset.vx = vx;
        element.dataset.vy = vy;
    };

    var getAcceleration = function(element) {
        var def = DEFAULT_GRAVITY;
        var ax = (element.dataset.ax || element.parentNode.dataset.ax || def);
        var ay = (element.dataset.ay || element.parentNode.dataset.ay || def);
        if(ax === 'center')
            ax = (element.offsetLeft + element.offsetWidth / 2 > element.parentNode.offsetWidth / 2) ? -def : def;
        if(ay === 'center')
            ay = (element.offsetTop  + element.offsetHeight / 2 > element.parentNode.offsetHeight / 2) ? -def : def;
        return new Vector(parseFloat(ax), parseFloat(ay));
    };

    //var setAcceleration = function(element, vector) {
    //    element.dataset.ax = Math.round(vector.x * 10) / 10;
    //    element.dataset.ay = Math.round(vector.y * 10) / 10;
    //};

    var testCircleRectCollision = function(circleElm, rectElm) {
        var circlePos = getPosition(circleElm);
        var circleArea = getArea(circleElm);
        var rectPos = getPosition(rectElm);
        var rectArea = getArea(rectElm);
        var rectangleCenter = new Vector(
            (rectPos.x + rectArea.x / 2),
            (rectPos.y + rectArea.y / 2)
        );

        var circleRadius = circleArea.x / 2;
        var w = rectArea.x / 2;
        var h = rectArea.y / 2;

        var dx = Math.abs(circlePos.x + circleRadius - rectangleCenter.x);
        var dy = Math.abs(circlePos.y + circleRadius - rectangleCenter.y);

        if (dx > (circleRadius + w) || dy > (circleRadius + h))
            return false;

        var v1 = getVelocity(circleElm);

        var circleDistance = new Vector(
            Math.abs((circlePos.x + circleRadius) - rectPos.x - w),
            Math.abs((circlePos.y + circleRadius) - rectPos.y - h)
        );

        var collision = false;
        if (circleDistance.x <= (w)) {
            collision = true;
        }

        if (circleDistance.y <= (h)) {
            collision = true;
        }


        var cornerDistanceSq =
            Math.pow(circleDistance.x - w, 2) +
            Math.pow(circleDistance.y - h, 2);

        if(!collision) {
            collision = (cornerDistanceSq <= (Math.pow(circleRadius, 2)));
            //v1 = v1.multiply(-0.5);
        }

        if(!collision)
            return false;
        var collisionEvent = new CustomEvent('collision', {
            detail: {
                withElement: circleElm
            },
            bubbles: true,
            cancelable: true
        });
        rectElm.dispatchEvent(collisionEvent);
        if(collisionEvent.defaultPrevented) 
            return true;

        var newPos = new Vector(0,0);

        var dirx = circlePos.x < rectPos.x + rectArea.x / 2 ? -1 : 1;
        newPos.x = dirx === -1 ? rectPos.x - circleArea.x : rectPos.x + rectArea.x;

        var diry = circlePos.y < rectPos.y + rectArea.y / 2 ? -1 : 1;
        newPos.y = diry === -1 ? rectPos.y - circleArea.y : rectPos.y + rectArea.y;

        if(Math.abs(newPos.x - circlePos.x) < Math.abs(newPos.y - circlePos.y)) {
            circlePos.x = newPos.x;
            v1.x = dirx * Math.abs(v1.x);
        } else {
            circlePos.y = newPos.y;
            v1.y = diry * Math.abs(v1.y);
        }

        v1 = v1.multiply(WALL_BOUNCE_COOEFICIENT);
        setPosition(circleElm, circlePos);
        setVelocity(circleElm, v1);

        //var v2 = getVelocity(rectElm);
        //var v2 = v1.multiply(-1);
        //v2 = v2.multiply(WALL_BOUNCE_COOEFICIENT);
        //setVelocity(rectElm, v2);
        return true;
    };

    var testCircleCollision = function(elm1, elm2) {

        var p1 = getPosition(elm1);
        var p2 = getPosition(elm2);
        var a1 = getArea(elm1);
        var a2 = getArea(elm2);
        var pc1 = p1.addVector(a1.multiply(.5));
        var pc2 = p2.addVector(a2.multiply(.5));

        var xd = (pc1.x) - (pc2.x);
        var yd = (pc1.y) - (pc2.y);

        var sumRadius = a1.x/2 + a2.x/2;
        var sqrRadius = sumRadius * sumRadius;

        var distSqr = (xd * xd) + (yd * yd);

        if(distSqr > sqrRadius)
            return false;

        var v1 = getVelocity(elm1);
        var v2 = getVelocity(elm2);

        // get the mtd
        var delta = (pc1.subtractVector(pc2));
        var distance = delta.getLength();
        // minimum translation distance to push balls apart after intersecting
        var mtd = delta.multiply(((a1.x / 2 + a2.x / 2)-distance)/distance);

        // resolve intersection --
        // inverse mass quantities
        var im1 = 1 / getMass(elm1);
        var im2 = 1 / getMass(elm2);

        // push-pull them apart based off their mass
        p1 = p1.addVector(mtd.multiply(im1 / (im1 + im2)));
        p2 = p2.subtractVector(mtd.multiply(im2 / (im1 + im2)));

        // impact speed
        var v = (v1.subtractVector(v2));
        var vn = v.dot(mtd.normalize());

        if(p1.x===p2.x && p1.y===p2.y)
            p1.x++;

        var collisionEvent = new CustomEvent('collision', {
            detail: {
                withElement: elm1,
                impulse: impulse
            },
            bubbles: true,
            cancelable: true
        });
        elm2.dispatchEvent(collisionEvent);
        if(collisionEvent.defaultPrevented) 
            return true;

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) {
            setPosition(elm1, p1);
            if (/marble/i.test(elm2.nodeName)) {
                setPosition(elm2, p2);
            }

        } else {
            // collision impulse
            var i = (-(1.0 + RESTITUTION) * vn) / (im1 + im2);
            var impulse = mtd.multiply(i);

            // change in momentum
            v1 = v1.addVector(impulse.multiply(im1));
            v1 = v1.multiply(BALL_BOUNCE_COOEFICIENT);

            v2 = v2.subtractVector(impulse.multiply(im2));
            v2 = v2.multiply(BALL_BOUNCE_COOEFICIENT);

            setVelocity(elm1, v1);
            setPosition(elm1, p1);

            if (/marble/i.test(elm2.nodeName)) {
                setVelocity(elm2, v2);
                setPosition(elm2, p2);
            }
        }
        return true;
    };


    var testRectContainment = function(element, parent) {
        var R = getRect(element);
        var RP = getRect(parent);
        var v;
        var collision = false;
        if(R.position.x < 0) {
            v = getVelocity(element);
            v.x = Math.abs(v.x);
            v = v.multiply(WALL_BOUNCE_COOEFICIENT);
            R.position.x = - R.position.x;
            setVelocity(element, v);
            setPosition(element, R.position);
            collision = true;
        }
        if(R.position.x + R.area.x > RP.area.x) {
            v = getVelocity(element);
            v.x = -Math.abs(v.x);
            v = v.multiply(WALL_BOUNCE_COOEFICIENT);
            R.position.x = RP.area.x - R.area.x;
            if(R.position.x < 0)
                R.position.x = 0;
            setVelocity(element, v);
            setPosition(element, R.position);
            collision = true;
        }
        if(R.position.y < 0) {
            v = getVelocity(element);
            v.y = Math.abs(v.y);
            v = v.multiply(WALL_BOUNCE_COOEFICIENT);
            R.position.y = - R.position.y;
            setVelocity(element, v);
            setPosition(element, R.position);
            collision = true;
        }
        if(R.position.y + R.area.y > RP.area.y) {
            v = getVelocity(element);
            v.y = -Math.abs(v.y);
            v = v.multiply(WALL_BOUNCE_COOEFICIENT);
            R.position.y = RP.area.y - R.area.y;
            if(R.position.y < 0)
                R.position.y = 0;
            setVelocity(element, v);
            setPosition(element, R.position);
            collision = true;
        }
        return collision;
    };

    // Vectors

    var Vector = function (x,y) {
        this.x = parseFloat(x) || 0;
        this.y = parseFloat(y) || 0;
    };

    Vector.prototype = {
        addVector: function(v) { return new Vector(this.x + v.x, this.y + v.y); },
        add: function(c) { return new Vector(this.x + c, this.y + c); },
        subtractVector: function(v) { return new Vector(this.x - v.x, this.y - v.y); },
        multiplyVector: function(v) { return new Vector(this.x * v.x, this.y * v.y); },
        multiply: function(m) { return new Vector(this.x * m, this.y * m); },
        div: function(d) { return new Vector(this.x / d, this.y / d); },
        reset: function ( x, y ) {
            this.x = x;
            this.y = y;

            return this;
        },

        toString : function (decPlaces) {
            decPlaces = decPlaces || 3;
            var scalar = Math.pow(10,decPlaces);
            return "[" + Math.round (this.x * scalar) / scalar + ", " + Math.round (this.y * scalar) / scalar + "]";
        },

        getDistance : function (v) {
            var xs = this.x - v.x;
            var ys = this.y - v.y;
            return Math.sqrt( xs * xs + ys * ys );
        },

        getLength : function() {
            return Math.sqrt( this.x * this.x + this.y * this.y );
        },
        dot : function (v) {
            return (this.x * v.x) + (this.y * v.y) ;
        },

        angle : function (useRadians) {
            return Math.atan2(this.y,this.x) * (useRadians ? 1 : 180 / Math.PI);
        },

        normalize : function () {
            var dist = Math.sqrt((this.x * this.x) + (this.y * this.y));
            if(dist === 0) {
                this.x = 0;
                this.y = 0;
            } else {
                this.x = this.x * ( 1.0 / dist );
                this.y = this.y * ( 1.0 / dist );
            }
            return this;
        },

        round : function() {
            this.x = parseInt(this.x * 10) / 10;
            this.y = parseInt(this.y * 10) / 10;
        },

        //rotate : function (angle, useRadians) {
        //    var cosRY = Math.cos(angle * (useRadians ? 1 : VectorConstants.TO_RADIANS));
        //    var sinRY = Math.sin(angle * (useRadians ? 1 : VectorConstants.TO_RADIANS));
        //
        //    VectorConstants.temp.copyFrom(this);
        //
        //    this.x = (VectorConstants.temp.x*cosRY)-(VectorConstants.temp.y*sinRY);
        //    this.y = (VectorConstants.temp.x*sinRY)+(VectorConstants.temp.y*cosRY);
        //
        //    return this;
        //},

        equals : function (v) {
            return((this.x==v.x)&&(this.y==v.x));
        }
    };

    var Rect = function(x, y, w, h) {
        this.position = new Vector(x, y);
        this.area = new Vector(w, h);
    };
})();