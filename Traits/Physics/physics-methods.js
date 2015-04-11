function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return [nx, ny];
}

function getRect(element) {
    var p = getPosition(element);
    var w = element.offsetWidth;
    var h = element.offsetHeight;
    return {left: p.x, top: p.y, right: p.x + w, bottom: p.y + h, width: w, height: h};
}

function getPosition(element) {
    var x = parseFloat(element.style.left || element.offsetLeft);
    var y = parseFloat(element.style.top || element.offsetTop);
    return {x:x, y:y};
}

function setPosition(element, x, y) {
    element.style.left = Math.round(x) + 'px';
    element.style.top = Math.round(y) + 'px';
}

function getVelocity(element) {
    var vx = parseFloat(element.dataset.vx || 0);
    var vy = parseFloat(element.dataset.vy || 0);
    return {vx:vx, vy:vy};
}

function setVelocity(element, vx, vy) {
//         console.log("Velocity: ", vx, vy);
    element.dataset.vx = vx;
    element.dataset.vy = vy;
}

function getAcceleration(element) {
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
}

function getAngle(element) {
    if(typeof element.dataset.a !== 'undefined')
        return parseFloat(element.dataset.a);

    var st = window.getComputedStyle(element, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
        st.getPropertyValue("-moz-transform") ||
        st.getPropertyValue("-ms-transform") ||
        st.getPropertyValue("-o-transform") ||
        st.getPropertyValue("transform") ||
        "FAIL";

// With rotate(30deg)...
// matrix(0.866025, 0.5, -0.5, 0.866025, 0px, 0px)

// rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix

    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    //var scale = Math.sqrt(a*a + b*b);

// arc sin, convert from radians to degrees, round
//    var sin = b/scale;
// next line works for 30deg but not 130deg (returns 50);
// var angle = Math.round(Math.asin(sin) * (180/Math.PI));
    return Math.round(Math.atan2(b, a) * (180/Math.PI));
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



// COLLISION

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


function getCollisionVector(x, y, test) {
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
}

function testCollision(element, element2) {
    if (element === element2)
        return false;

    if (element2.offsetLeft > element.offsetLeft + element.offsetWidth)
        return false;

    if (element2.offsetLeft + element2.offsetWidth < element.offsetLeft)
        return false;

    if (element2.offsetTop > element.offsetTop + element.offsetHeight)
        return false;

    if (element2.offsetTop + element2.offsetHeight < element.offsetTop)
        return false;

    var collisionEvent = new CustomEvent('collision', {
        detail: {
            withElement: element,
            isCollisionPoint: function (x, y) {
                return true;
            }
        },
        cancelable: true
    });

    if (collisionEvent.defaultPrevented)
        return false;


    var test = collisionEvent.detail.isCollisionPoint;
    var dx = element.offsetLeft - element2.offsetLeft;
    var dy = element.offsetTop - element2.offsetTop;

    if (collisionPoints.length === 0) {
        collisionPoints.push([0, 0]);
        collisionPoints.push([element.offsetWidth, 0]);
        collisionPoints.push([0, element.offsetHeight]);
        collisionPoints.push([element.offsetWidth, element.offsetHeight]);
    }

    for (var i = 0; i < collisionPoints.length; i++) {
        var point = [collisionPoints[i][0], collisionPoints[i][1]];
        var angle = getAngle(element);
        if (angle) {
            angle = (angle % 360);
            if (angle > 180)
                angle -= 360;
            point = rotate(element.offsetWidth / 2, element.offsetHeight / 2, point[0], point[1], angle);
        }

        point[0] = parseInt(point[0] + dx);
        point[1] = parseInt(point[1] + dy);

        if (point[0] < 0) point[0] = 0;
        if (point[0] > tankElm.offsetWidth) point[0] = tankElm.offsetWidth;
        if (point[1] < 0) point[1] = 0;
        if (point[1] > tankElm.offsetHeight) point[1] = tankElm.offsetHeight;
        if (test(point[0], point[1])) {
            var topPoint = climb(point[0], point[1] - 1, test);
            var pushVector = [topPoint[0] - point[0], topPoint[1] - point[1]];
            var position = getPosition(element);
            position.x += pushVector[0];
            position.y += pushVector[1];
            setPosition(element, position.x, position.y);

            var vector = getCollisionVector(topPoint[0], topPoint[1], test);
            var vectorAngle = Math.atan2(vector.vy, vector.vx) * 180 / Math.PI + 90;
            if (!vector.vx && !vector.vy)
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
            va = Math.abs(angle - vectorAngle) / 2 * (angle > vectorAngle ? -1 : 1);
            va *= WALL_BOUNCE_COOEFICIENT;

            setAngleVelocity(element, va);

            break;
        }

    }

}


function testRectContainment(element, parent) {
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
}