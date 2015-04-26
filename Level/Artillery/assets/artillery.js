/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var RENDER_INTERVAL_MAX = 1000;
var RENDER_INTERVAL = 100;
var WALL_BOUNCE_COOEFICIENT = 0.20;

var CANNON_VELOCITY = [100,12];

var GRAVITY = 2;
var WIND = 0;

document.addEventListener('render', renderArtilleryElements, false);
//document.addEventListener('stats', onStats, true);
document.addEventListener('fire', onFire, true);
//document.addEventListener('collision', onCollision, true);

function testRectContainment(element) {
}

function replaceUseWithSource(useElement) {
    var url = useElement.getAttributeNS('xlink', 'href') || useElement.getAttribute('href') || useElement.getAttribute('xlink:href');
    if(url.charAt(0) !== '#') throw new Error("No #");
    var id = url.substr(1);
    var templateElement = document.getElementById(id).cloneNode(true);
    templateElement.setAttribute('style', useElement.getAttribute('style'));
    templateElement.setAttribute('class', useElement.getAttribute('class'));
    templateElement.setAttribute('transform', useElement.getAttribute('transform'));
    templateElement.setAttribute('id', useElement.getAttribute('id') || id + '_copy');
    useElement.parentNode.appendChild(templateElement);
    useElement.parentNode.removeChild(useElement);
    return templateElement;
}

function renderTank(element, duration) {
    //if(duration > RENDER_INTERVAL_MAX)
    //    duration = RENDER_INTERVAL_MAX;
    if(element.nodeName.toLowerCase() === 'use')
        element = replaceUseWithSource(element);
    testRectContainment(element);
}

function renderTankPart(tankPart, duration) {

    tankPart.vx = (tankPart.vx || 0) + WIND * duration / 1000;
    tankPart.vy = (tankPart.vy || 0) + GRAVITY * duration / 1000;
//     tankPart.va = (tankPart.va || 0) 

    var bb = tankPart.getBoundingClientRect();
    var svgTransform = tankPart.transform.baseVal[0];
    var matrix = svgTransform.matrix;
    var scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
    var scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
    var curAngle = (360 + Math.round(Math.atan2(matrix.b, matrix.a) * (180/Math.PI))) % 360;

    matrix.e += tankPart.vx * duration / 1000;
    matrix.f += tankPart.vy * duration / 1000;
    svgTransform.setMatrix(matrix.rotate(tankPart.va * duration / 1000));
    //curAngle += tankPart.va * duration / 1000;

//     tankPart.setAttribute('transform', 'translate(' + matrix.e + ', ' + matrix.f + ') scale(' + scaleX + ', ' + scaleY + ') rotate(' + curAngle + ') ');

    var collisionElement = document.elementFromPoint((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);
    if(collisionElement === null
        || (collisionElement.classList
            && !collisionElement.classList.contains('nohit')
            && collisionElement !== tankPart
            && collisionElement.parentNode !== tankPart
            && collisionElement.sourceTank !== tankPart.sourceTank)
        ) {
        tankPart.parentNode.removeChild(tankPart);
        explodeAt((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);
        return;
    }

    testRectContainment(tankPart);
}

function renderProjectile(projectile, duration) {
    if(duration > RENDER_INTERVAL_MAX)
        duration = RENDER_INTERVAL_MAX;

    projectile.vx = (projectile.vx || 0) + WIND * duration / 1000;
    projectile.vy = (projectile.vy || 0) + GRAVITY * duration / 1000;

    var svgTransform = projectile.transform.baseVal[0];
    var matrix = svgTransform.matrix;

    var scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
    var scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
    var vectorAngle = (180 + Math.atan2(projectile.vy, projectile.vx) * 180 / Math.PI) % 360;

    //svgTransform.setMatrix(matrix.translate(
    matrix.e += projectile.vx * duration / 1000;
    matrix.f += projectile.vy * duration / 1000;
    //));

    //var curAngle = (360 + Math.round(Math.atan2(matrix.b, matrix.a) * (180/Math.PI))) % 360;
    projectile.setAttribute('transform', 'translate(' + matrix.e + ', ' + matrix.f + ') rotate(' + vectorAngle + ') scale(' + scaleX + ', ' + scaleY + ')');

    var bb = projectile.getBoundingClientRect();
    var collisionElement = document.elementFromPoint((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);
    if(collisionElement === null) {
        console.error('null projectile', projectile);
        detonateProjectile(projectile);
        return;
    }
//     console.log("collision: ", [collisionElement, projectile]);
    if(collisionElement === projectile
        || collisionElement === projectile.sourceTank
        || collisionElement.parentNode === projectile.sourceTank
        || collisionElement.parentNode.parentNode === projectile.sourceTank
    )
        return;
    if(collisionElement.classList
        && collisionElement.classList.contains('nohit'))
        return;


    switch(collisionElement.nodeName.toLowerCase()) {
        case 'g':
        case 'path':
        case 'circle':
        case 'rect':
            if(collisionElement.parentNode.classList.contains('tank'))
                collisionElement = collisionElement.parentNode;
            else if(collisionElement.parentNode.parentNode.classList.contains('tank'))
                collisionElement = collisionElement.parentNode.parentNode;
            break;

        default:
            console.error('unknown collision element: ', collisionElement, projectile);
            break;
    }
    detonateProjectile(projectile, collisionElement);

}


function renderExplosion(explosion, duration) {
    if(duration > RENDER_INTERVAL_MAX)
        duration = RENDER_INTERVAL_MAX;

    explosion.vx = (explosion.vx || 0) + WIND * duration / 10000;
    explosion.vy = (explosion.vy || 0) + -GRAVITY * duration / 10000;

    var bb = explosion.getBoundingClientRect();
    var x = bb.left;
    var y = bb.top;

    try {
        var svgTransform = explosion.transform.baseVal[0];
        var matrix = svgTransform.matrix;
        x = matrix.e;
        y = matrix.f;
    } catch (e) {

    }

    x += explosion.vx * duration / 1000;
    y += explosion.vy * duration / 1000;

    var opacity = parseFloat(explosion.style.opacity || 1);

    if(opacity <= 0.01) {
        explosion.parentNode.removeChild(explosion);
        return true;
    }
    explosion.setAttribute('transform', 'translate(' + x + ', ' + y + ') rotate(' + (opacity * 20) + ') scale(' + (50 * Math.pow(opacity-0.9, 2)) + ', ' + (20 * (opacity - 0.8)) + ')');
    explosion.style.opacity = opacity * (opacity>0.1?0.95:0.98);
    return false;
}

function renderArtilleryElements(e) {
    var tanks = e.target.getElementsByClassName('tank');
    for(var i=0; i<tanks.length; i++)
        renderTank(tanks[i], RENDER_INTERVAL);

    var projectiles = e.target.getElementsByClassName('projectile');
    for(i=0; i<projectiles.length; i++)
        renderProjectile(projectiles[i], RENDER_INTERVAL);

    var tankParts = e.target.getElementsByClassName('tank-part');
    for(i=0; i<tankParts.length; i++)
        renderTankPart(tankParts[i], RENDER_INTERVAL);

    var explosions = e.target.getElementsByClassName('explosion');
    for(i=0; i<explosions.length; i++)
        renderExplosion(explosions[i], RENDER_INTERVAL);
}

function onFire(e) {
    var tank = e.target;

    if(e.detail.clickEvent) {
        var clickEvent = e.detail.clickEvent;
        var bb = tank.getBoundingClientRect();
        var dx = clickEvent.layerX - bb.left - bb.width/2;
        var dy = clickEvent.layerY - bb.top - bb.height/2;
        var d = Math.sqrt(dx*dx + dy*dy) - 100;
        if(d<0) d=0;
        var cannonAngle = (-50 + 360 + Math.atan2(dx, dy) * 120 / Math.PI) % 360;
        if(cannonAngle<0 || cannonAngle>270) cannonAngle = 0;
        if(cannonAngle>70) cannonAngle = 70;

        //         console.log(cannonAngle, (d<500?d:500)/500);
        fireCannon(tank, cannonAngle, (d<500?d:500)/500 + 0.2);
    }

    //destroyTank(e.target);
}

function aimCannon(tankElement, cannonAngle, power) {

//.attr('d', 'M' + [
//        [850, 75], [958, 137.5], [958, 262.5],
//        [850, 325], [742, 262.6], [742, 137.5]
//    ].join('L') + 'Z')
}

function fireCannon(tankElement, cannonAngle, power) {

    if(tankElement.nodeName.toLowerCase() === 'use')
        tankElement = replaceUseWithSource(tankElement);

    var spriteGroup = tankElement.parentNode; // document.getElementById('sprites');

    var tankBB = tankElement.getBoundingClientRect();
    var tankMatrix = tankElement.transform.baseVal[0].matrix;
    var angle = (360 + Math.round(Math.atan2(tankMatrix.b, tankMatrix.a) * (180/Math.PI))) % 360;

    if(cannonAngle) {
        var cannonGroup = tankElement.getElementsByClassName('cannon-group')[0];
        cannonGroup.setAttribute('transform', 'rotate(' + -cannonAngle + ')');
        angle -= cannonAngle % 360;
    }

    var point = [(tankBB.right + tankBB.left) / 2, (tankBB.bottom + tankBB.top) / 2];
    var cannonTip = tankElement.getElementsByClassName('cannon-tip')[0];
    if(cannonTip) {
        var bb = cannonTip.getBoundingClientRect();
        point = [(bb.right + bb.left) / 2, (bb.bottom + bb.top) / 2];
    }


    var xmlns = "http://www.w3.org/2000/svg";
    var svgns = 'http://www.w3.org/2000/xlink/namespace/';
    var projectile = tankElement.ownerDocument.createElementNS(xmlns, 'use');

    projectile.setAttributeNS(svgns,'xlink:href','#projectile-template');
    projectile.href.baseVal = '#projectile-template';

    projectile.setAttribute('transform', 'translate(' + point[0] + ', ' + point[1] + ') rotate(' + 0 + ')');

    projectile.classList.add('projectile');
    projectile.sourceTank = tankElement;
    spriteGroup.insertBefore(projectile, spriteGroup.firstChild);


    var velocity = CANNON_VELOCITY.slice();
    velocity[0] *= power || 1;
    velocity[1] *= power || 1;
    velocity = rotate(0, 0, velocity[0], velocity[1], angle);
    projectile.vx = velocity[0];
    projectile.vy = velocity[1];

    //explodeAt(point[0], point[1], tankBB.height/2);

    var cannonProjection = document.getElementById('cannon-projection');
    var projPoint = point;
    var pathPoints = [point.slice()];
    var projVelocity = [projectile.vx, projectile.vy];
    for(var i=0; i<100; i++) {
        projVelocity[0] += WIND;
        projVelocity[1] += GRAVITY;
        projPoint[0] += projVelocity[0];
        projPoint[1] += projVelocity[1];
        if(projPoint[0] < 0 || projPoint[0] > 1000) break;
        if(projPoint[1] < 0 || projPoint[1] > 1000) break;
        pathPoints.push(projPoint.slice());
    }

    cannonProjection.setAttributeNS(null, "d", 'M' + pathPoints.join('L') );

}


function detonateProjectile(projectile, tankElement) {
    if(tankElement && tankElement.classList.contains('tank')) {
        tankElement.vx = (tankElement.vx || 0) + projectile.vx / 4;
        tankElement.vy = (tankElement.vy || 0) + projectile.vy / 4;
        destroyTank(tankElement);
    }
    var bb = projectile.getBoundingClientRect();
    var x = bb.left + bb.width/2;
    var y = bb.top + bb.height/2;

    var fontSize = parseFloat(window.getComputedStyle(projectile, null).getPropertyValue('font-size'));

    explodeAt(x, y, fontSize);
    projectile.parentElement.removeChild(projectile);
}

function destroyTank(tankElement) {
    if(!tankElement.classList.contains('tank'))
        throw new Error("Not a tank: ", tankElement);
    var paths = tankElement.children;

    for(var i=paths.length-1; i>=0; i--) {
        paths[i].setAttribute('class', 'tank-part'); //  + element.getAttribute('class'));
        paths[i].setAttribute('transform', tankElement.getAttribute('transform'));
        paths[i].setAttribute('style', tankElement.getAttribute('style'));

        paths[i].va = (tankElement.va || 0) + Math.random() * 60 - 30;
        paths[i].vx = (tankElement.vx || 0) + Math.random() * 60 - 30;
        paths[i].vy = (tankElement.vy || 0) + Math.random() * 60 - 50;
        paths[i].sourceTank = tankElement;
        tankElement.parentNode.appendChild(paths[i]);
    }

    tankElement.parentNode.removeChild(tankElement);
}

function explodeAt(x, y, size) {
    var spriteGroup = document.getElementById('sky');

    var explosionElement = document.getElementById('explosion-template').cloneNode(true);

    explosionElement.classList.add('explosion');
    explosionElement.setAttribute('transform', 'translate(' + x + ', ' + y + ') scale(4)');
    spriteGroup.appendChild(explosionElement);
}

//function getTransformValues(element) {
//    var st = window.getComputedStyle(element, null);
//    var tr = st.getPropertyValue("-webkit-transform") ||
//        st.getPropertyValue("-moz-transform") ||
//        st.getPropertyValue("-ms-transform") ||
//        st.getPropertyValue("-o-transform") ||
//        st.getPropertyValue("transform") ||
//        "FAIL";
//
//    if (!tr || tr === 'none' || tr === 'FAIL')
//        return false;
//
//    return tr.split('(')[1].split(')')[0].split(',').map( function( num ){ return parseFloat( num) } );
//}


function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return [nx, ny];
}
