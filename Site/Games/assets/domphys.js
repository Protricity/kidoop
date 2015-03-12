/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

    var DEFAULT_GRAVITY = 0; // 0.7;
    var WALL_BOUNCE_COOEFICIENT = 0.60;
    var BALL_BOUNCE_COOEFICIENT = 0.45;
    var FRAME_TIME = 10;

    var RENDER_INTERVAL = 50;
    var RESTITUTION = 3;


    var getClassValue = function(element, className) {
        var regex = new RegExp("\\b" + className + ":([0-9.-]+)\\b");
        var match = element.className.match(regex);
        if(!match)
            return 0;
        return parseFloat(match[1]);
    };

    var setClassValue = function(element, className, value) {
        var regex = new RegExp("\s*\\b" + className + ":([0-9.-]+)\\b", 'g');
        element.className = element.className.replace(regex, '');
        element.className += ' ' + className + ':' + value;
    };

    var lastDragObject = null;
    var initObject = function(element) {
        if(typeof element.domphys !== 'undefined')
            return;
        element.domphys = true;

        //setPosition(element, getPosition(element));
        var onDrag = function(e) {
            var isPhysBox = false;
            if(this.classList.contains('physbox')) {
                isPhysBox = true;
            } else if (this.classList.contains('draggable') || this.getAttribute('draggable')) {
                lastDragObject = e.target;
            } else {
                return false;

            }
//             console.log(e.type);
            element.dataset.drag = e.type;
            switch(e.type) {
                case 'dragstart': 
//                     lastDragObject = element;
                    break;
                case 'dragover':
                    e.stopPropagation();
//                         e.dataTransfer.dropEffect = 'move';  
                    if(isPhysBox) {
//                         e.target.dr/agObject = element;
                        e.preventDefault();
                    }
                    break;
                case 'dragenter': 
                    e.target.classList.remove('dragleave');
                    e.target.classList.add('dragenter');
                break;
                case 'dragleave':
                    e.target.classList.remove('dragenter');
                    e.target.classList.add('dragleave');
                break;
                case 'drop':
                    e.target.classList.remove('dragleave');
                    e.target.classList.remove('dragenter');
                    e.target.classList.add('drop');
                    console.log(lastDragObject, e);
                    if(lastDragObject !== null) {
                        e.target.appendChild(lastDragObject);
                        lastDragObject.dataset.remove('x');
                        lastDragObject.dataset.remove('y');
                    }
                    lastDragObject = null;
                    break;
                case 'dragend': 
                    lastDragObject = null;
                    break;
                default: break;
            }
        };
        element.addEventListener('dragstart', onDrag, false);
        element.addEventListener('dragover', onDrag, false);
        element.addEventListener('dragenter', onDrag, false);
        element.addEventListener('dragleave', onDrag, false);
        element.addEventListener('drop', onDrag, false);
        element.addEventListener('dragend', onDrag, false);
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
        var x = parseFloat(element.dataset.x) || element.offsetLeft;
        var y = parseFloat(element.dataset.y) || element.offsetTop;
        return new Vector(x, y);
    };

    var setPosition = function(element, vector) {
//         if(element.lastVector && vector.getDistance(element.lastVector) < 1)
//             return;
//         element.lastVector = vector;
        element.dataset.x = parseInt(vector.x * 10) / 10;
        element.dataset.y = parseInt(vector.y * 10) / 10;
    };

    var getVelocity = function(element) {
        var vx = parseFloat(element.dataset.vx) || 0; // getClassValue(element, 'vx');
        var vy = parseFloat(element.dataset.vy) || 0; // getClassValue(element, 'vy');
        return new Vector(vx, vy);
    };

    var setVelocity = function(element, vector) {
        element.dataset.vx = parseInt(vector.x * 10) / 10;
        element.dataset.vy = parseInt(vector.y * 10) / 10;
    };

    var getAcceleration = function(element) {
        var def = DEFAULT_GRAVITY;
//         if(!element.dataset.vx)
//             def = 0;
        var ax = parseFloat(element.dataset.ax) || element.parentNode.dataset.ax || def / 2;
        var ay = parseFloat(element.dataset.ay) || element.parentNode.dataset.ay || def;
        return new Vector(ax, ay);
    };

    var setAcceleration = function(element, vector) {
        element.dataset.ax = parseInt(vector.x * 10) / 10;
        element.dataset.ay = parseInt(vector.y * 10) / 10;
    };

    var renderElement = function(element) {
        var pos = getPosition(element);
        element.style.left = Math.round(pos.x) + 'px';
        element.style.top = Math.round(pos.y) + 'px';
        if(!element.style.position)
            element.style.position = 'absolute';
    };

    var testCollision = function(elm1, elm2) {
         if(elm1.dataset.collision === 'circle') {
             if(elm2.dataset.collision === 'circle') {
                 return testCircleCollision(elm1, elm2);
             }
         }
        return testCircleCollision(elm1, elm2);
    };

    var testRectCollision = function(elm1, elm2) {
        var v;
        var R1 = getRect(elm1);
        var R2 = getRect(elm2);
        var collision = false;
        if(R1.position.x < R2.position.x && R1.position.x + R1.area.x > R2.position.x) {
            if (R1.position.y < R2.position.y && R1.position.y + R1.area.y > R2.position.y) {
                R1.position.x = R2.position.x - R1.area.x;
                v = getVelocity(elm1);
                v.x = -Math.abs(v.x);
                v = v.multiply(WALL_BOUNCE_COOEFICIENT);
                setPosition(elm1, R1.position);
                setVelocity(elm1, v);

                v = getVelocity(elm2);
                v.x = Math.abs(v.x);
                v = v.multiply(WALL_BOUNCE_COOEFICIENT);
                    
                if (R1.position.x < 0) {
                    R1.position.x = 0;
                    R2.position.x = R1.position.x + R1.area.x;
                    setPosition(elm2, R2.position);
                }
                setPosition(elm1, R1.position);
                setVelocity(elm2, v);

                if(R1.position.x < R2.position.x && R1.position.x + R1.area.x > R2.position.x) {
                    R1.position.y = R2.position.y - R1.area.y;
                    if (R1.position.y >= 0) {
                        v = getVelocity(elm1);
                        v.y = -Math.abs(v.y);
                        v = v.multiply(WALL_BOUNCE_COOEFICIENT);
                        setPosition(elm1, R1.position);
                        setVelocity(elm1, v);

                    } else {
                        v = getVelocity(elm2);
                        v.y = Math.abs(v.y);
                        v = v.multiply(WALL_BOUNCE_COOEFICIENT);
                        R1.position.y = 0;
                        R2.position.y = R1.position.y + R1.area.y;
                        setPosition(elm2, R2.position);
                        setPosition(elm1, R1.position);
                        setVelocity(elm2, v);
                    }
                }
                collision = true;
            }
        }
        return collision;
    };

    var isCollidingCircles = function(elm1, elm2) {
        var R1 = getRect(elm1);
        var R2 = getRect(elm2);
        var p1 = R1.position;
        var p2 = R2.position;

        var xd = p1.x - p2.x;
        var yd = p1.y - p2.y;

        var sumRadius = R1.area.x/2 + R2.area.x/2;
        var sqrRadius = sumRadius * sumRadius;

        var distSqr = (xd * xd) + (yd * yd);

        return (distSqr <= sqrRadius)
    };

    var testCircleCollision = function(elm1, elm2) {
        if(elm1 === elm2)
            return false;

        if(!isCollidingCircles(elm1, elm2))
            return false;

        var a1 = getArea(elm1);
        var a2 = getArea(elm2);
        var p1 = getPosition(elm1);
        var p2 = getPosition(elm2);
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

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) {

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
            setVelocity(elm2, v2);
        }

        setPosition(elm1, p1);
        setPosition(elm2, p2);
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


    var doReady = function() {
        doRender();
    };

    var lastRender = new Date();
    var doRender = function() {
        var time = new Date();
        var totalElapsedTime = time - lastRender;
        lastRender = time;
        var physboxes = document.getElementsByClassName('physbox');
        for(var pi=0; pi<physboxes.length; pi++) {

            var physbox = physboxes[pi];
            var objects = physbox.getElementsByClassName('physitem');

            initObject(physbox);

            for(var i=0; i<objects.length; i++) {
                var object = objects[i];
                initObject(object);

                var v = getVelocity(object);
                var p = getPosition(object);
                p.x += v.x;
                p.y += v.y;
                setPosition(object, p);

                var hasCollision = false;
                for(var k=0; k<objects.length; k++) {
                    if(object !== objects[k])
                        hasCollision = testCollision(object, objects[k]) || hasCollision;
                }
                hasCollision = testRectContainment(object, object.parentNode) || hasCollision;

        //             if(!hasCollision) {
                var a = getAcceleration(object);
                v = getVelocity(object);
                    if(a.x || a.y) {
                    v.x += a.x;
                    v.y += a.y;
                    setVelocity(object, v);
                }
        //             }
            }

            for(i=0; i<objects.length; i++) {
                renderElement(objects[i]);
            }
        }

        if(totalElapsedTime > RENDER_INTERVAL) {
    //             console.log(totalElapsedTime);
            setTimeout(doRender, 1);
        } else {
            setTimeout(doRender, RENDER_INTERVAL - totalElapsedTime);
        }
    };

    jQuery(document).ready(function() {
        jQuery('body')
            .on('render', doRender)
            .on('ready', doReady);
        setTimeout(doReady, 100);
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