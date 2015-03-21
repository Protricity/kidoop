/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    var ITEM_CLASS = 'physics';

    var DEFAULT_GRAVITY = 1; // 0.7;
    var WALL_BOUNCE_COOEFICIENT = 0.70;

    var RENDER_INTERVAL = 30;
    var RESTITUTION = 3;

    var coalesce = function(arg1, arg2, arg3) {
        for(var i=0; i<arguments.length; i++) {
            if(typeof arguments[i] === 'undefined' || arguments[i] === null)
                continue;
               
            return arguments[i];
        }  
        return null;
    };

    var triggerCollisionEvent = function (element, element2) {
        element.dispatchEvent(new CustomEvent("collision", {
            detail: {
                with: element2
            },
            bubbles: true,
            cancelable: true
        }));
    };

    var getArea = function(element) {
        var w = parseFloat(element.dataset.width) || element.offsetWidth;
        var h = parseFloat(element.dataset.height) || element.offsetHeight;
        return new Vector(w, h);
    };

    var getRect = function(element) {
        var position = getPosition(element);
        var area = getArea(element);
        return new Rect(position.x, position.y, area.x, area.y);
    };

    var getMass = function(element) {
        return element.dataset.mass || element.offsetWidth * element.offsetHeight;
    };

    var getPosition = function(element) {
        var x = parseFloat(coalesce(element.dataset.x, element.offsetLeft));
        var y = parseFloat(coalesce(element.dataset.y, element.offsetTop));
        return new Vector(x, y);
    };

    var setPosition = function(element, vector) {
//         if(!element.classList.contains(CLASS_PHYSICS))
//             return;
        element.dataset.x = Math.round((vector.x) * 10) / 10;
        element.dataset.y = Math.round((vector.y) * 10) / 10;
    };

    var getVelocity = function(element) {
        var vx = parseFloat(coalesce(element.dataset.vx, 0)); // getClassValue(element, 'vx');
        var vy = parseFloat(coalesce(element.dataset.vy, 0)); // getClassValue(element, 'vy');
        return new Vector(vx, vy);
    };

    var setVelocity = function(element, vector) {
        var vx = Math.round(vector.x * 100) / 100;
        var vy = Math.round(vector.y * 100) / 100;
        if(element.dataset.vx != vx) element.dataset.vx = vx;
        if(element.dataset.vy != vy) element.dataset.vy = vy;
    };

    var getAcceleration = function(element) {
        var def = DEFAULT_GRAVITY;
//         if(!element.dataset.vx)
//             def = 0;
        var ax = (coalesce(element.dataset.ax, element.parentNode.dataset.ax, def));
        var ay = (coalesce(element.dataset.ay, element.parentNode.dataset.ay, def));
        if(ax === 'center')
            ax = (element.offsetLeft + element.offsetWidth / 2 > element.parentNode.offsetWidth / 2) ? -def : def;
        if(ay === 'center')
            ay = (element.offsetTop  + element.offsetHeight / 2 > element.parentNode.offsetHeight / 2) ? -def : def;
        return new Vector(parseFloat(ax), parseFloat(ay));
    };

    var setAcceleration = function(element, vector) {
        if(!element.classList.contains(CLASS_PHYSICS))
            return;
        element.dataset.ax = Math.round(vector.x * 10) / 10;
        element.dataset.ay = Math.round(vector.y * 10) / 10;
    };

    var renderElement = function(element) {
        var pos = getPosition(element);
        element.style.left = Math.round(pos.x) + 'px';
        element.style.top = Math.round(pos.y) + 'px';
         //if(!element.style.position)
         //    element.style.position = 'absolute';
    };

    var testRectCollision = function(elm1, elm2) {
        var p1 = getPosition(elm1);
        var a1 = getArea(elm1);
        var p2 = getPosition(elm2);
        var a2 = getArea(elm2);

        var outside =
            (p2.x > p1.x + a1.x)
            || (p2.x + a2.x < p1.x)
            || (p2.y > p1.y + a1.y)
            || (p2.y + a2.y < p1.y);

        if(!outside) {
            var event = new CustomEvent("collision", {
                detail: { with: elm2 },
                bubbles: true,
                cancelable: true
            });
            elm1.dispatchEvent(event);
            //console.log("Rect Collision: ", [elm1, elm2]);
            //if(!event.defaultPrevented || true) {
                var p1 = getPosition(elm1);
                var p2 = getPosition(elm2);

                if (p1.x > p2.x && p1.x < p2.x + a2.x) {
                    if (p1.y > p2.y && p1.y < p2.y + a2.y) {
                        //make blocks not move
//                         p1.x = p2.x + a2.x;
//                         setPosition(elm1, p1);
//                         renderElement(elm1);
                    }
                }
            //}
            return true;
        }
        return false;
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

    var lastRender = new Date();
    var paused = false;
    var timeout = null;
    var doRender = function() {
        var time = new Date();
        var totalElapsedTime = time - lastRender;
        if(totalElapsedTime > 1000)
            totalElapsedTime = RENDER_INTERVAL;
        lastRender = time;
        var objects = document.getElementsByClassName(ITEM_CLASS);

        for(var i=0; i<objects.length; i++) {
            var object = objects[i];

            var v = getVelocity(object);
            var a = getAcceleration(object);
            if(a.x || a.y) {
                v.x += a.x * (totalElapsedTime / 1000);
                v.y += a.y * (totalElapsedTime / 1000);
                setVelocity(object, v);
            }

            var siblings = object.parentNode.children;
            for(var k=0; k<siblings.length; k++)
                if(object !== siblings[k])
                    testRectCollision(object, siblings[k]);
            testRectContainment(object, object.parentNode);

            var v = getVelocity(object);
            var p = getPosition(object);
            p.x += v.x;
            p.y += v.y;
            setPosition(object, p);

            renderElement(objects[i]);

        }

        if(paused)
            return;

        clearTimeout(timeout);
        if(totalElapsedTime > RENDER_INTERVAL) {
            timeout = setTimeout(doRender, 1);
        } else {
            timeout = setTimeout(doRender, RENDER_INTERVAL - totalElapsedTime);
        }
    };

    var onReady = function() {
        if(typeof document.physics_js !== 'undefined')
            return;

        document.physics_js = true;

        if(!paused)
            doRender();
    };

    document.addEventListener('DOMContentLoaded', onReady);
    document.addEventListener('ready', onReady);
    document.addEventListener('render', doRender);
    document.addEventListener('pause', function() {
        paused = true;
    });
    document.addEventListener('resume', function() {
        if(paused) {
            paused = false;
            doRender();
        }
    });


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