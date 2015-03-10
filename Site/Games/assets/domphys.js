/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

    var DEFAULT_GRAVITY = 550;
    var BOUNCE_COOEFICIENT = 0.95;
    var FRAME_TIME = 100;

    var RENDER_INTERVAL = 10;

    var lastRender = new Date();

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

    var getX = function(element) { return getClassValue(element, 'x'); };
    var setX = function(element, x) {
        element.style.left = x + 'px';
        return setClassValue(element, 'x', x);
    };
    var getY = function(element) { return getClassValue(element, 'x'); };
    var setY = function(element, y) {
        element.style.top = y + 'px';
        return setClassValue(element, 'y', y);
    };

    var getVX = function(element) { return getClassValue(element, 'vx'); };
    var getVY = function(element) { return getClassValue(element, 'vy'); };
    var getAX = function(element) { return getClassValue(element, 'ax'); };
    var getAY = function(element) { return getClassValue(element, 'ay'); };

    var setVX = function(element, vx) { return setClassValue(element, 'vx', vx); };
    var setVY = function(element, vy) { return setClassValue(element, 'vy', vy); };
    var setAX = function(element, ax) { return setClassValue(element, 'ax', ax); };
    var setAY = function(element, ay) { return setClassValue(element, 'ay', ay); };

    var bounce = function(elm1, elm2) {
        var vx1 = getVX(elm1);
        var vx2 = getVX(elm2);

    };

    var testRectCollision = function(elm1, elm2) {
        if(elm1.offsetLeft > elm2.offsetLeft) {
            if(elm1.offsetTop > elm2.offsetTop) {
                if(elm1.offsetLeft < elm2.offsetLeft + elm2.offsetWidth) {
                    if(elm1.offsetTop < elm2.offsetTop + elm2.offsetHeight) {
                        setX(elm1, elm2.offsetLeft + elm2.offsetWidth);
                        setY(elm1, elm2.offsetTop + elm2.offsetHeight);
                    }
                }
            }
        } else {
            if(elm1.offsetTop < elm2.offsetTop) {
                if(elm1.offsetLeft + elm1.offsetWidth > elm2.offsetLeft) {
                    if(elm1.offsetTop + elm2.offsetHeight > elm2.offsetTop) {
                        setX(elm1, elm2.offsetLeft - elm1.offsetWidth);
                        setY(elm1, elm2.offsetTop - elm1.offsetHeight);
                    }
                }
            }
        }
    };

    var testRectContainment = function(element, parent) {
        var vx, vy;
        if(element.offsetLeft + element.offsetWidth > parent.offsetWidth) {
            vx = getVX(element);
            if(vx) {
                vx = -Math.abs(vx);
                vx *= BOUNCE_COOEFICIENT;
                setVX(element, vx);
            }
            element.offsetLeft = 2 * (parent.offsetWidth - element.offsetWidth) - element.offsetLeft;
        }
        if(element.offsetLeft < 0) {
            vx = getVX(element);
            if(vx) {
                vx = Math.abs(vx);
                vx *= BOUNCE_COOEFICIENT;
                setVX(element, vx);
            }
            element.offsetLeft = -element.offsetLeft;
        }

        if(element.offsetTop + element.offsetHeight > parent.offsetHeight) {
            vy = getVY(element);
            if(vy) {
                vy = -Math.abs(vy);
                vy *= BOUNCE_COOEFICIENT;
                setVY(element, vy);
            }
            element.offsetTop = 2 * (parent.offsetHeight - element.offsetHeight) - element.offsetTop;
        }
        if(element.offsetTop < 0) {
            vy = getVY(element);
            if(vy) {
                vy = Math.abs(vy);
                vy *= BOUNCE_COOEFICIENT;
                setVY(element, vy);
            }
            element.offsetTop = -element.offsetTop;
        }
    };


    var doReady = function() {
        doRender();
    };
    var doRender = function() {
        var time = new Date();
        var totalElapsedTime = time - lastRender;
        lastRender = time;
        while(true) {
            var elapsedTime = totalElapsedTime;
            if(elapsedTime > FRAME_TIME)
                elapsedTime = FRAME_TIME;

            var objects = document.getElementsByTagName('object');
            var collisions = {'rect':[], 'circle':[]};
            for(var i=0; i<objects.length; i++) {
                var object = objects[i];
                var ax = getAX(object);
                var ay = getAY(object) || DEFAULT_GRAVITY;
                var vx = getVX(object);
                var vy = getVY(object);
                var x = getX(object);
                var y = getY(object);

                if (object.style.left)
                    x = parseFloat(object.style.left);
                if (object.style.top)
                    y = parseFloat(object.style.top);

                x += vx * elapsedTime / 1000;
                y += vy * elapsedTime / 1000;
                vx += ax * elapsedTime / 1000;
                vy += ay * elapsedTime / 1000;
                setX(object, x);
                setY(object, y);
                setVX(object, vx);
                setVY(object, vy);

                for(var k=0; k<objects.length; k++) {
                     if(object !== objects[k])
                         testRectCollision(object, objects[k]);
                }
                testRectContainment(object, object.parentNode);
            }

            totalElapsedTime -= elapsedTime;
            if(totalElapsedTime < FRAME_TIME)
                break;
        }

        setTimeout(doRender, RENDER_INTERVAL);
    };

    jQuery(document).ready(function() {
        jQuery('body')
            .on('render', doRender)
            .on('ready', doReady);
        setTimeout(doReady, 100);
    });
})();

