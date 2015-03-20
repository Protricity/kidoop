/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    var COLLISION_CLASS = 'collision';
    var TYPE_SQUARE = 'square';
    var TYPE_CIRCLE = 'circle';

    var WALL_BOUNCE_COOEFICIENT = 0.90;
    var BALL_BOUNCE_COOEFICIENT = 0.3;

    var RESTITUTION = 4;

    var coalesce = function(arg1, arg2, arg3) {
        for(var i=0; i<arguments.length; i++) {
            if(typeof arguments[i] === 'undefined' || arguments[i] === null)
                continue;
               
            return arguments[i];
        }  
        return null;
    };
    
    var max = function(arg1, arg2) {
        var max = null;
        for(var i=0; i<arguments.length; i++)
            if(arguments[i] > max)
                max = arguments[i];
        return max;
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
        var v2 = getVelocity(rectElm);

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


        if(collision) {
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
        }
        var cornerDistanceSq =
            Math.pow(circleDistance.x - w, 2) +
            Math.pow(circleDistance.y - h, 2);

        if(!collision) {
            collision = (cornerDistanceSq <= (Math.pow(circleRadius, 2)));
            v1 = v1.multiply(-0.5);
        }

        if(!collision)
            return false;

        // change in momentum

        setVelocity(circleElm, v1);
        if(rectElm.classList.contains(COLLISION_CLASS)) {
            v2 = v1.multiply(-0.5);
            setVelocity(rectElm, v2);
        }
        return true;


    };

    var testRectCollision = function(elm1, elm2) {
        var p1 = getPosition(elm1);
        var a1 = getArea(elm1);
        var p2 = getPosition(elm2);
        var a2 = getArea(elm2);

        var w = (a1.x + a2.x) / 2;
        var h = (a1.y + a2.y) / 2;
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;

        if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
            var v1 = getVelocity(elm1);
            if(p1.x < p2.x && p1.x + a1.x > p2.x) {
                v1.x = -Math.abs(v1.x);
                v1 = v1.multiply(WALL_BOUNCE_COOEFICIENT);
                p1.x = p2.x - a1.x;
                if(p1.x < 0)
                    p1.x = 0;

            } else if (p1.x > p2.x && p1.x < p2.x + a2.x) {
                v1.x = Math.abs(v1.x);
                v1 = v1.multiply(WALL_BOUNCE_COOEFICIENT);
                p1.x = p2.x + a2.x;

            }
            
            if(p1.y < p2.y && p1.y + a1.y > p2.y) {
                v1.y = -Math.abs(v1.y);
                v1 = v1.multiply(WALL_BOUNCE_COOEFICIENT);
                p1.y = p2.y - a1.y;
                if(p1.y < 0)
                    p1.y = 0;

            } else if (p1.y > p2.y && p1.y < p2.y + a2.y) {
                v1.y = Math.abs(v1.y);
                v1 = v1.multiply(WALL_BOUNCE_COOEFICIENT);
                p1.y = p2.y + a2.y;

            }
            
            setPosition(elm1, p1);
            setVelocity(elm1, v1);

            return true;
        }

        return false;
    };

    var testCircleCollision = function(elm1, elm2) {

        var p1 = getPosition(elm1);
        var p2 = getPosition(elm2);
        var a1 = getArea(elm1);
        var a2 = getArea(elm2);

        var xd = p1.x - p2.x;
        var yd = p1.y - p2.y;

        var sumRadius = a1.x/2 + a2.x/2;
        var sqrRadius = sumRadius * sumRadius;

        var distSqr = (xd * xd) + (yd * yd);

        if(distSqr > sqrRadius)
            return false;

        var v1 = getVelocity(elm1);
        var v2 = getVelocity(elm2);

        // get the mtd
        var delta = (p1.subtractVector(p2));
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

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) {
            setPosition(elm1, p1);
            setPosition(elm2, p2);

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
            if(elm2.classList.contains(COLLISION_CLASS)) {
                setVelocity(elm2, v2);
                setPosition(elm2, p2);
            }
        }
        return true;
    };


    var onCollision = function(e) {
        var elm1 = e.target;
        var elm2 = e.detail.with;

        if(!elm1.classList.contains(COLLISION_CLASS))
            return false;

        if(!elm2.classList.contains(COLLISION_CLASS))
            return false;

        e.preventDefault();
        if(elm1.classList.contains(TYPE_CIRCLE)) {
            if (elm2.classList.contains(TYPE_CIRCLE))
                return testCircleCollision(elm1, elm2);
            return testCircleRectCollision(elm1, elm2);
        }
        return testRectCollision(elm1, elm2);
    };

//     var onReady = function() {
//         if(typeof document.collision_js !== 'undefined')
//             return;

//         document.collision_js = true;
//     };

    document.addEventListener('collision', onCollision, false);
//     document.addEventListener('DOMContentLoaded', onReady);
//     document.addEventListener('ready', onReady);







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