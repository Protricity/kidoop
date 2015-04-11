/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var RENDER_INTERVAL = 10000;
var DEFAULT_GRAVITY = 5;
var WALL_BOUNCE_COOEFICIENT = 0.20;

var svgDoc = document.getElementsByTagName('svg')[0];
var tankElm = null;

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return [nx, ny];
}

var getIntersectionList = function(rect, svgDoc) {
    var resultList = null;
    try {
        resultList = svgDoc.getIntersectionList(rect, null);
    } catch(e) { }

    return resultList;
};

var getRect = function(element) {
    var p = getPosition(element);
    var w = element.offsetWidth;
    var h = element.offsetHeight;
    return {left: p.x, top: p.y, right: p.x + w, bottom: p.y + h, width: w, height: h};
};

var getPosition = function(element) {
    var x = parseFloat(element.style.left || element.offsetLeft);
    var y = parseFloat(element.style.top || element.offsetTop);
    return {x:x, y:y};
};

var setPosition = function(element, x, y) {
    element.style.left = Math.round(x) + 'px';
    element.style.top = Math.round(y) + 'px';
};

var getVelocity = function(element) {
    var vx = parseFloat(element.dataset.vx || 0);
    var vy = parseFloat(element.dataset.vy || 0);
    return {vx:vx, vy:vy};
};

var setVelocity = function(element, vx, vy) {
//         console.log("Velocity: ", vx, vy);
    element.dataset.vx = vx;
    element.dataset.vy = vy;
};

var getAcceleration = function(element) {
    var def = DEFAULT_GRAVITY;
    var ax = (element.dataset.ax || element.parentNode.dataset.ax || 0);
    var ay = (element.dataset.ay || element.parentNode.dataset.ay || def);
    switch(ax) {
        case 'center':
            ax = (element.offsetLeft + element.offsetWidth / 2 > element.parentNode.offsetWidth / 2) ? -def : def;
            break;
        //case 'mouse':
        //    break;
        default: break;
    }
    switch(ay) {
        case 'center':
            ay = (element.offsetTop  + element.offsetHeight / 2 > element.parentNode.offsetHeight / 2) ? -def : def;
            break;
        //case 'mouse':
        //    break;
        default: break;
    }
    return {ax:ax, ay:ay};
};

function getAngle(element) {
    return parseFloat(element.dataset.a) || 0;
}

function getAngleVelocity(element) {
    return parseFloat(element.dataset.va) || 0;
}

function setAngle(element, degrees) {
    degrees = parseInt(degrees * 10) / 10;
    element.dataset.a = degrees;
    element.style.transform = 'rotate(' + degrees + 'deg)';
}

function setAngleVelocity(element, degreeVelocity) {
    degreeVelocity = parseInt(degreeVelocity * 100) / 100;
    element.dataset.va = degreeVelocity;
}

var getCollisionVector = function(x, y, test) {
    var vx = 0;
    var vy = 0;

    var d = 0;
    while(vx === 0 || vy === 0) {
        vx += (test(x - d, y) ? 1 / d : 0) + (test(x + d, y) ? -1 / d : 0);
        vy += (test(x, y - d) ? 1 / d : 0) + (test(x, y + d) ? -1 / d : 0);
        d++;
        if(d>5)
            break;
    }
    //if(!vx && !vy)
    //    vy = -1;
//     console.log("Vector: ", vx, vy, d);
    return {vx:vx, vy:vy};
};

var collisionPoints = [];
var doSVGCollision = function(element, svgContainerElement) {

    var svgDocument = svgContainerElement.contentDocument.documentElement;
    var collisionEvent = new CustomEvent('collision', {
        detail: {
            //points: points,
            //collisionPoints: [],
            //pushVector: [],
            //collisionVector: [],
            withElement: element,
            svgContainerElement: svgContainerElement,
            svgDocument: svgDocument,
            testCollisionPoint: false
        },
        cancelable: true
    });

    svgDocument.dispatchEvent(collisionEvent);

    if(collisionEvent.detail.testCollisionPoint) {
        var test = collisionEvent.detail.testCollisionPoint;
        var dx = element.offsetLeft - svgContainerElement.offsetLeft;
        var dy = element.offsetTop - svgContainerElement.offsetTop;

        if(collisionPoints.length === 0) {
            collisionPoints.push([0, 0]);
            collisionPoints.push([element.offsetWidth, 0]);
            collisionPoints.push([0, element.offsetHeight]);
            collisionPoints.push([element.offsetWidth, element.offsetHeight]);
        }

        for(var i=0; i<collisionPoints.length; i++) {
            var point = [collisionPoints[i][0], collisionPoints[i][1]];
            var angle = getAngle(element);
            if(angle) {
                angle = (angle % 360);
                if(angle > 180)
                    angle -= 360;
                point = rotate(element.offsetWidth / 2, element.offsetHeight / 2, point[0], point[1], angle);
            }

            point[0] = parseInt(point[0] + dx);
            point[1] = parseInt(point[1] + dy);
            
            if(point[0] < 0) point[0] = 0;
            if(point[0] > svgContainerElement.offsetWidth) point[0] = svgContainerElement.offsetWidth;
            if(point[1] < 0) point[1] = 0;
            if(point[1] > svgContainerElement.offsetHeight) point[1] = svgContainerElement.offsetHeight;
            if(test(point[0], point[1])) {
                var topPoint = climb(point[0], point[1] - 1, test);
                var pushVector = [topPoint[0] - point[0], topPoint[1] - point[1]];
                var position = getPosition(element);
                position.x += pushVector[0];
                position.y += pushVector[1];
                setPosition(element, position.x, position.y);

                var vector = getCollisionVector(topPoint[0], topPoint[1], test);
                var vectorAngle = Math.atan2(vector.vy, vector.vx) * 180/Math.PI + 90;
                if(!vector.vx && !vector.vy)
                    vector.vy = -1;
                var velocity = getVelocity(element);
                var imp = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
                imp *= WALL_BOUNCE_COOEFICIENT;
                velocity.vx = vector.vx * imp;
                velocity.vy = vector.vy * imp;
                setVelocity(element, velocity.vx, velocity.vy);


                //va = (point[0] - element.offsetWidth) / element.offsetWidth;
                //va += (Math.abs(point[1] - element.offsetHeight) * (angle > vectorAngle ? -1 : 1)) / element.offsetHeight;
//                 va = -va;

                var va = getAngleVelocity(element);
                va = Math.abs(angle-vectorAngle) / 2 * (angle > vectorAngle ? -1 : 1);
                va *= WALL_BOUNCE_COOEFICIENT;

                setAngleVelocity(element, va);

                break;
            }
        }

//            if(collisionEvent.detail.collisionPoints.length) {
//                for (var i = 0; i < collisionEvent.detail.collisionPoints.length; i++) {
//                    var collisionPoint = collisionEvent.detail.collisionPoints[i];
//                    var vector = getCollisionVector(collisionPoint[0], collisionPoint[1], collisionEvent.detail.testCollisionPoint);
//                    var velocity = getVelocity(element);
//                    var imp = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
//                    imp *= WALL_BOUNCE_COOEFICIENT;
////                     velocity.vx = vector.vx * imp;
////                     velocity.vy = vector.vy * imp;
////                     setVelocity(element, velocity.vx, velocity.vy);
////                     setVelocity(element,0 ,0);
//
//                }
//            }
        //var test = collisionEvent.detail.testCollisionPoint(0,0);
    }
};

function climb(x, y, test) {
    var vy = -1;
    while(true) {
        if(!test(x, y))
            break;
        y+=vy;
        //vy--;
    }
    return [x, y];
}

var testCollision = function(element, element2) {
    if (element === element2)
        return false;

    if(element2.offsetLeft > element.offsetLeft + element.offsetWidth)
        return false;

    if(element2.offsetLeft + element2.offsetWidth < element.offsetLeft)
        return false;

    if(element2.offsetTop > element.offsetTop + element.offsetHeight)
        return false;

    if(element2.offsetTop + element2.offsetHeight < element.offsetTop)
        return false;

    if(element2.nodeName.toLowerCase() === 'object') {
        return doSVGCollision(element, element2);
    }

    //console.log("Collision: ", [element, element2]);
};


var testRectContainment = function(element, parent) {
    var R = getRect(element);
    var RP = getRect(parent);
    var v;
    var collision = false;
    if(R.left < 0) {
        v = getVelocity(element);
        v.vx = Math.abs(v.vx);
        v.vx *= WALL_BOUNCE_COOEFICIENT;
        R.left = 0;
        setVelocity(element, v.vx, v.vy);
        setPosition(element, R.left, R.top);
        collision = true;
    }
    if(R.right > RP.width) {
        v = getVelocity(element);
        v.vx = -Math.abs(v.vx);
        v.vx *= WALL_BOUNCE_COOEFICIENT;
        R.left = RP.width - R.width;
        setVelocity(element, v.vx, v.vy);
        setPosition(element, R.left, R.top);
        collision = true;
    }
    if(R.top < 0) {
        v = getVelocity(element);
        v.vy = Math.abs(v.vy);
        v.vy *= WALL_BOUNCE_COOEFICIENT;
        R.top = 0;
        setVelocity(element, v.vx, v.vy);
        setPosition(element, R.left, R.top);
        collision = true;
    }
    if(R.bottom > RP.height) {
        v = getVelocity(element);
        v.vy = -Math.abs(v.vy);
        v.vy *= WALL_BOUNCE_COOEFICIENT;
        R.top = RP.height - R.height;
        setVelocity(element, v.vx, v.vy);
        setPosition(element, R.left, R.top);
        collision = true;
    }

    if(collision) {
        //var va = getAngleVelocity(element);
        //va = Math.abs(angle-vectorAngle) / 2 * (angle > vectorAngle ? -1 : 1);
        //va *= WALL_BOUNCE_COOEFICIENT;
        //
        //setAngleVelocity(element, va);
    }
    return collision;
};


var testSVGCollisionPoint = function(svg, rect) {

    var list = getIntersectionList(rect, svg);
    console.log(list);
};

var onRender = function(e) {
    var parentElement = (e.detail || {}).parentElement;
    if(!parentElement)
        return;
    if(!tankElm)
        tankElm = parentElement;
    var rect = svgDoc.getBBox();
    //console.log(tankElm, rect);

    var time = new Date();
    var totalElapsedTime = time - (tankElm.lastRender || new Date());
    if(totalElapsedTime > RENDER_INTERVAL || totalElapsedTime < 0)
        totalElapsedTime = RENDER_INTERVAL;
    tankElm.lastRender = time;

    var v = getVelocity(tankElm);
    var p = getPosition(tankElm);
    var a = getAcceleration(tankElm);
    if(a.ax || a.ay) {
        v.vx = (v.vx || 0) + a.ax * totalElapsedTime / 1000;
        v.vy = (v.vy || 0) + a.ay * totalElapsedTime / 1000;
        setVelocity(tankElm, v.vx, v.vy);
    }

    p.x += v.vx;
    p.y += v.vy;
    setPosition(tankElm, p.x, p.y);

    var siblings = tankElm.parentNode.children;
    for(var k=0; k<siblings.length; k++) {
        var sibling = siblings[k];
        testCollision(tankElm, sibling);
    }
    testRectContainment(tankElm, tankElm.parentNode);

    p = getPosition(tankElm);
    setPosition(tankElm, p.x, p.y);
    //render(tankElm);

    var angleVelocity = getAngleVelocity(tankElm);
    if(angleVelocity) {
        var angle = getAngle(tankElm);
        angle += angleVelocity;
        setAngle(tankElm, angle);
    }
};

var onCollision = function(e) {
    var tankElm = e.target;
    var withElm = e.detail.withElement;
//         console.log("Collision: ", [tankElm, withElm]);
};


var onStats = function (e) {
//         e.detail.stats.tank = {
//             data: 'data'
//         }
};

document.addEventListener('render', onRender, false);
//     setTimeout(onRender, RENDER_INTERVAL);
document.addEventListener('collision', onCollision, true);
document.addEventListener('stats', onStats, true);

