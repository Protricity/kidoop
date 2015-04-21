function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return [nx, ny];
}

function getMatrixInverse(a, b, c, d, e, f) {
    var dt = a * d - b * c;	// determinant(), skip DRY here...

    var m = [];
    m[0] = d / dt;
    m[1] = -b / dt;
    m[2] = -c / dt;
    m[3] = a / dt;
    m[4] = (c * f - d * e) / dt;
    m[5] = -(a * f - b * e) / dt;

    return m;
}

function transform(x, y, a, b, c, d, e, f) {
    return [
        x * a + y * c + e,
        x * b + y * d + f
    ];
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

//
//function transformXYInto(element, x, y) {
//    var values = getTransformValues(element);
//    if(!values) return [x, y];
//    var point = transform(x, y, values[0], values[1], values[2], values[3], values[4], values[5]);
//    return [point[0], point[1]]
//}
//
//function transformXYOutOf(element, x, y) {
//    var values = getTransformValues(element);
//    if(!values) return [x + element.offsetLeft, y + element.offsetTop];
//    else values = getMatrixInverse(values[0], values[1], values[2], values[3], values[4], values[5]);
//    var point = transform(x, y, values[0], values[1], values[2], values[3], values[4], values[5]);
//    return [point[0], point[1]]
//}

function getTransformValues(element) {
    var st = window.getComputedStyle(element, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
        st.getPropertyValue("-moz-transform") ||
        st.getPropertyValue("-ms-transform") ||
        st.getPropertyValue("-o-transform") ||
        st.getPropertyValue("transform") ||
        "FAIL";

    if (!tr || tr === 'none' || tr === 'FAIL')
        return false;

    return tr.split('(')[1].split(')')[0].split(',').map( function( num ){ return parseFloat( num) } );
}


function getAngle(element) {
    var values = getTransformValues(element);
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    return (360 + Math.round(Math.atan2(b, a) * (180/Math.PI))) % 360;
}

function getAngleVelocity(element) {
    return parseFloat(element.dataset.va) || 0;
}

function addAngle(element, degrees) {
    degrees = parseInt(degrees * 10) / 10;
    element.dataset.a = degrees;

    var values = getTransformValues(element);
    if(values)
        element.style.transform = 'matrix(' + values.join(',') + ') rotate(' + degrees + 'deg)';
    else
        element.style.transform = 'rotate(' + degrees + 'deg)';
}

function setAngle(element, degrees) {
    degrees = parseInt(degrees * 10) / 10;
    element.dataset.a = degrees;

    var values = getTransformValues(element);
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    var scaleX = Math.sqrt((a * a) + (c * c));
    var scaleY = Math.sqrt((b * b) + (d * d));
    var scale = Math.sqrt(a*a + b*b);
    if(Math.round(scale*10)/10 === 1) {
        element.style.transform = 'rotate(' + degrees + 'deg)';
    } else {
        element.style.transform = 'rotate(' + degrees + 'deg) scale(' + scale + ')';
    }
//     var values = getTransformValues(element);
//     if(values)
//         element.style.transform = 'matrix(' + values.join(',') + ') rotate(' + degrees + 'deg)';
//     else
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
        var bb1 = element.getBoundingClientRect();
        for(var k=0; k<siblings.length; k++) {
            var sibling = siblings[k];
            if(sibling === element)
                continue;
            var bb2 = sibling.getBoundingClientRect();
            if(    bb1.right  < bb2.left
                || bb1.left   > bb2.right
                || bb1.bottom < bb2.top
                || bb1.top    > bb2.bottom
            )
                continue;
            testCollision(element, sibling, duration);
            if(!element || !element.parentNode)
                break;
        }
        if(!element || !element.parentNode)
            return;

        testRectContainment(element, element.parentNode, duration);

        var angleVelocity = getAngleVelocity(element);

        if(angleVelocity) {
            //angle += angleVelocity;
            addAngle(element, angleVelocity);
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
    throw new Error("No exit point found: ", [x, y]);
}

function testCollision(element, element2) {
    if (element === element2)
        return false;

    var transform1 = getTransformValues(element);
    var transform2 = getTransformValues(element2);
    var transformInverse = false;
    if(transform2)
        transformInverse = getMatrixInverse(transform2[0], transform2[1], transform2[2], transform2[3], transform2[4], transform2[5]);

    var collisionEvent = new CustomEvent('collision', {
        detail: {
            points: [[0,0]],

            withElement: element,
            testPoint: function (x, y) {
                return (Math.abs(x) > element2.offsetWidth/2
                    || Math.abs(y) > element2.offsetHeight/2);
                //return true; // (x>=0 && y>=0); //  && x<=document.offsetWidth && y<=document.offsetHeight);
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

    var test = collisionEvent.detail.testPoint;

    var points = collisionEvent.detail.points || [];

    for (var i = 0; i < points.length; i++) {
        var point = [points[i][0], points[i][1]];

        if(transform1)
            point = transform(point[0], point[1], transform1[0], transform1[1], transform1[2], transform1[3], transform1[4], transform1[5]);

        point[0] += (element.offsetLeft + element.offsetWidth/2) - (element2.offsetLeft + element2.offsetWidth/2);
        point[1] += (element.offsetTop + element.offsetHeight/2) - (element2.offsetTop + element2.offsetHeight/2);

        if(transform2)
            point = transform(point[0], point[1], transformInverse[0], transformInverse[1], transformInverse[2], transformInverse[3], transformInverse[4], transformInverse[5]);

        point = [Math.round(point[0]), Math.round(point[1])];
        if (test(point[0], point[1])) {
            collisionEvent.detail.onCollisionPoint(point[0], point[1]);

            if(!element)
                break;

            var exitPoint = findExitPoint(test, point[0], point[1]);
            var position = getPosition(element);
            position.x += exitPoint[0];
            position.y += exitPoint[1];
            setPosition(element, position.x, position.y);

            var vector = getCollisionVector(point[0] + exitPoint[0], point[1] + exitPoint[1], test);
            var velocity = getVelocity(element);
            var imp = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
            imp *= WALL_BOUNCE_COOEFICIENT;
            velocity.vx = vector[0] * imp;
            velocity.vy = vector[1] * imp;
            setVelocity(element, velocity.vx, velocity.vy);

            var angle = getAngle(element) + 360 % 360;
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

/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
function doPolygonsIntersect (a, b) {
    var polygons = [a, b];
    var minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {

        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        var polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            var i2 = (i1 + 1) % polygon.length;
            var p1 = polygon[i1];
            var p2 = polygon[i2];

            // find the line perpendicular to this edge
            var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.y * a[j].y;
                if (isUndefined(minA) || projected < minA) {
                    minA = projected;
                }
                if (isUndefined(maxA) || projected > maxA) {
                    maxA = projected;
                }
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.y * b[j].y;
                if (isUndefined(minB) || projected < minB) {
                    minB = projected;
                }
                if (isUndefined(maxB) || projected > maxB) {
                    maxB = projected;
                }
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA) {
                CONSOLE("polygons don't intersect!");
                return false;
            }
        }
    }
    return true;
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