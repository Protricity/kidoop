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
    if(!element.style)
        return {x:0, y:0};
    var x = parseFloat(element.style.left || element.offsetLeft);
    var y = parseFloat(element.style.top || element.offsetTop);
    return {x:x, y:y};
}

function setPosition(element, x, y) {
//     element.setAttribute('style', 'left: ' + x + 'px; top:' + y + 'px;');
    element.style.left = Math.round(x * 10) / 10 + 'px';
    element.style.top = Math.round(y * 10) / 10 + 'px';
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
        return (360 + parseFloat(element.dataset.a)) % 360;

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


    if(!tr || tr === 'none')
        return 0;
        
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
    var angle = (360 + Math.round(Math.atan2(b, a) * (180/Math.PI))) % 360;
    if(element.classList.contains('reversed'))
        angle = (angle + 180) % 360;
    return angle;
}

function getAngleVelocity(element) {
    return parseFloat(element.dataset.va) || 0;
}

function setAngle(element, degrees) {
    degrees = parseInt(degrees * 10) / 10;
    element.dataset.a = degrees;
    var transform = 'rotate(' + degrees + 'deg)';
    if(element.classList.contains('reversed'))
        transform += ' scaleX(-1)';
    element.style.transform = transform;
}

function setAngleVelocity(element, degreeVelocity) {
    degreeVelocity = parseInt(degreeVelocity * 100) / 100;
    element.dataset.va = degreeVelocity;
}

// Rendering


var RENDER_INTERVAL_MAX = 1000;
function renderElement(element, duration) {
    var v = getVelocity(element);
    var p = getPosition(element);
    var a = getAcceleration(element);
    var angle = getAngle(element);
    if(duration > RENDER_INTERVAL_MAX)
        duration = RENDER_INTERVAL_MAX;
    if(element.classList.contains('fixed')) {
        //setPosition(element, p.x, p.y);

    } else {

        if(a.ax || a.ay) {
            v.vx = (v.vx || 0) + a.ax * duration / 1000;
            v.vy = (v.vy || 0) + a.ay * duration / 1000;
            setVelocity(element, v.vx, v.vy);
        }

        p.x += v.vx * duration / 1000;
        p.y += v.vy * duration / 1000;
        setPosition(element, p.x, p.y);

        var siblings = element.parentNode.children;
        for(var k=0; k<siblings.length; k++) {
            var sibling = siblings[k];
            testCollision(element, sibling, duration);
            if(!element)
                break;
        }
        if(!element || !element.parentNode)
            return;

        testRectContainment(element, element.parentNode, duration);

        var angleVelocity = getAngleVelocity(element);

        if(angleVelocity) {
            angle += angleVelocity;
            setAngle(element, angle);
        }
    }

    //
    //p = getPosition(element);
    //setPosition(element, p.x, p.y);
}


// COLLISION


function getCollisionVector(x, y, test) {
    var v = [0,0];
    if(!test(x-1, y)) v[0] += 1;
    if(!test(x+1, y)) v[0] -= 1;
    if(!test(x, y-1)) v[1] += 1;
    if(!test(x, y+1)) v[1] -= 1;

    if(!test(x-1, y-1)) v = [v[0]-1, v[1]-1];
    if(!test(x+1, y-1)) v = [v[0]+1, v[1]-1];
    if(!test(x+1, y+1)) v = [v[0]+1, v[1]+1];
    if(!test(x-1, y+1)) v = [v[0]-1, v[1]+1];
    return v;
}

function findExitPoint(test, x, y) {
    for(var d=1; d<999; d++) {
        if(!test(x, y-d)) return [0, -d];
        if(!test(x, y+d)) return [0, d];

        if(!test(x+d, y)) return [d, 0];
        if(!test(x-d, y)) return [-d, 0];

        if(!test(x-d, y-d)) return [-d, -d];
        if(!test(x+d, y-d)) return [d, -d];
        if(!test(x+d, y+d)) return [d, d];
        if(!test(x-d, y+d)) return [-d, d];
    }
    throw new Error("No exit point found");
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
            points: null,
            withElement: element,
            isCollisionPoint: function (x, y) {
                return (x>=0 && y>=0); //  && x<=document.offsetWidth && y<=document.offsetHeight);
            },
            onCollisionPoint: function (x, y) {

            }
        },
        cancelable: true,
        bubbles: true
    });

    element2.dispatchEvent(collisionEvent);

    if (collisionEvent.defaultPrevented)
        return false;

    var test = collisionEvent.detail.isCollisionPoint;
    var dx = element.offsetLeft - element2.offsetLeft;
    var dy = element.offsetTop - element2.offsetTop;

    var points = collisionEvent.detail.points || [];
    if(points.length === 0) {
        points.push([0, 0]);
        points.push([element.offsetWidth, 0]);
        points.push([0, element.offsetHeight]);
        points.push([element.offsetWidth, element.offsetHeight]);
    }

    var angle = getAngle(element);
    for (var i = 0; i < points.length; i++) {
        var point = [points[i][0], points[i][1]];
        if (angle) {
            angle = (angle % 360);
            if (angle > 180)
                angle -= 360;
            point = rotate(element.offsetWidth / 2, element.offsetHeight / 2, point[0], point[1], angle);
        }

        point[0] = parseInt(point[0] + dx);
        point[1] = parseInt(point[1] + dy);

        if (point[0] < 0) point[0] = 0;
        if (point[0] > element2.offsetWidth) point[0] = element2.offsetWidth;
        if (point[1] < 0) point[1] = 0;
        if (point[1] > element2.offsetHeight) point[1] = element2.offsetHeight;
        if (test(point[0], point[1])) {
//test(point[0], point[1]);
            collisionEvent.detail.onCollisionPoint(point[0], point[1]);

            if(!element)
                break;

            var exitPoint = findExitPoint(test, point[0], point[1]);
            var position = getPosition(element);
            position.x += exitPoint[0];
            position.y += exitPoint[1];
            setPosition(element, position.x, position.y);

            var vector = getCollisionVector(point[0] + exitPoint[0], point[1] + exitPoint[1], test);
//             if (!vector[0] && !vector[1])
//                vector[1] = -1;
            var velocity = getVelocity(element);
            var imp = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
            imp *= WALL_BOUNCE_COOEFICIENT;
            velocity.vx = vector[0] * imp;
            velocity.vy = vector[1] * imp;
            setVelocity(element, velocity.vx, velocity.vy);


            //va = (point[0] - element.offsetWidth) / element.offsetWidth;
            //va += (Math.abs(point[1] - element.offsetHeight) * (angle > vectorAngle ? -1 : 1)) / element.offsetHeight;
            //    va = -va;

            var vectorAngle = (180 + 360 + Math.atan2(vector[0], vector[1]) * 180 / Math.PI) % 360;
            var va = -getAngleVelocity(element);
            va *= 0.5;
            va += Math.abs(angle - vectorAngle) / 50 * (angle > vectorAngle ? -1 : 1);

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


function include(src, doc) {
    if(!doc) doc = document;
    if(/\.js$/i.test(src)) {
        var scripts = doc.head.getElementsByTagName('script');
        for(var si=0; si<scripts.length; si++)
            if(scripts[si].getAttribute('src') == src)
                return false;

        var script = doc.createElement('script');
        script.setAttribute('src', src);
        doc.head.appendChild(script);
        return true;

    } else if (/\.css$/i.test(src)) {
        var links = doc.head.getElementsByTagName('link');
        for(var li=0; li<links.length; li++)
            if(links[li].getAttribute('href') == src)
                return false;

        var link = doc.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', src);
        doc.head.appendChild(link);
        return true;
    } else {
        throw new Error("Invalid SRC: " + src);
    }
}