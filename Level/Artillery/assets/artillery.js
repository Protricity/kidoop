/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var RENDER_INTERVAL_MAX = 1000;
var RENDER_INTERVAL = 100;
var WALL_BOUNCE_COOEFICIENT = 0.20;

var CANNON_VELOCITY = [100,0];

var GRAVITY = 4;
var WIND = 0;

document.addEventListener('render', renderArtilleryElements, false);
//document.addEventListener('stats', onStats, true);
document.addEventListener('fire', onFire, true);
document.addEventListener('aim', onAim, true);
//document.addEventListener('collision', onCollision, true);

function testRectContainment(element) {
}


function testNoHit(element) {
    while(element) {
        if(element.classList.contains('nohit')) {
            console.log("No hit: ", element); 
            return element;
        }
        if(element === document || element === document.rootElement)
            return null;
        element = element.parentNode;
    }
    return null;
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
    useElement.parentNode.insertBefore(templateElement, useElement)
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
    var svgTransform = tankPart.transform.baseVal.getItem(0);
    var matrix = svgTransform.matrix;
    var scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
    var scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
    var curAngle = (360 + Math.round(Math.atan2(matrix.b, matrix.a) * (180/Math.PI))) % 360;

    matrix.e += tankPart.vx * duration / 1000;
    matrix.f += tankPart.vy * duration / 1000;
    svgTransform.setMatrix(matrix.rotate(tankPart.va * duration / 1000));

    var collisionElement = document.elementFromPoint((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);

    if(collisionElement === tankPart || testNoHit(collisionElement))
        return;

    if(collisionElement !== null || bb.bottom > 600) {
        tankPart.parentNode.removeChild(tankPart);
        explodeAt((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);
    }

    testRectContainment(tankPart);
}

var transformRegex = /^translate\(([^)]+)\) rotate\(([^)]+)\) scale\(([^)]+)\)$/;

function renderProjectile(projectile, duration) {
    if(duration > RENDER_INTERVAL_MAX)
        duration = RENDER_INTERVAL_MAX;

    projectile.vx = (projectile.vx || 0) + WIND * duration / 1000;
    projectile.vy = (projectile.vy || 0) + GRAVITY * duration / 1000;

    var svgTransform = projectile.transform.baseVal.getItem(0);
    var matrix = svgTransform.matrix;

    var attrTransform = projectile.getAttribute('transform');
    var match = transformRegex.exec(attrTransform);

    
    var scale = match ? match[3] : 1;
    var vectorAngle = (180 + Math.atan2(projectile.vy, projectile.vx) * 180 / Math.PI) % 360;

    matrix.e += projectile.vx * duration / 1000;
    matrix.f += projectile.vy * duration / 1000;
//     svgTransform.setMatrix(matrix);


    projectile.setAttribute('transform', 'translate(' + matrix.e + ', ' + matrix.f + ') rotate(' + vectorAngle + ') scale(' + scale + ')');

    var bb = projectile.getBoundingClientRect();
    var collisionElement = document.elementFromPoint((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);

    if((collisionElement.classList && collisionElement.classList.contains('projectile'))
        || testNoHit(collisionElement))
        return;

    if(collisionElement !== null || bb.bottom > 600)
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
        var svgTransform = explosion.transform.baseVal.getItem(0);
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
    if(e.target.classList.contains('flipped') !== e.detail.flipped)
        e.detail.flipped ? e.target.classList.add('flipped') : e.target.classList.remove('flipped');
    fireCannon(e.target, e.detail.angle, e.detail.power);
}

function onAim(e) {
    if(e.target.classList.contains('flipped') !== e.detail.flipped)
        e.detail.flipped ? e.target.classList.add('flipped') : e.target.classList.remove('flipped');
    aimCannon(e.target, e.detail.angle, e.detail.power);
}

function aimCannon(tankElement, cannonAngle, cannonPower) {
    if(tankElement.nodeName.toLowerCase() === 'use')
        tankElement = replaceUseWithSource(tankElement);

    var tankBB = tankElement.getBoundingClientRect();
    var tankMatrix = tankElement.transform.baseVal.getItem(0).matrix;
    var angle = (360 + Math.round(Math.atan2(tankMatrix.b, tankMatrix.a) * (180/Math.PI))) % 360;

    if(cannonAngle) {
        if(cannonAngle<0 || cannonAngle>270) cannonAngle = 0;
        if(cannonAngle>70) cannonAngle = 70;
        var cannonRotate = tankElement.getElementsByClassName('cannon-rotate')[0];
        cannonRotate.setAttribute('transform', 'rotate(' + -cannonAngle + ')');
        angle -= cannonAngle % 360;
    }
//     angle -= 7;

    var point = [(tankBB.right + tankBB.left) / 2, (tankBB.bottom + tankBB.top) / 2];
    var cannonTip = tankElement.getElementsByClassName('cannon-tip')[0];
    if(cannonTip) {
        var bb = cannonTip.getBoundingClientRect();
        point = [(bb.right + bb.left) / 2, (bb.bottom + bb.top) / 2];
    }

    if(tankElement.classList.contains('flipped'))
        angle += 180;

    var velocity = CANNON_VELOCITY.slice();

    if(cannonPower < 0.1) cannonPower = 0.1;
    if(cannonPower > 1) cannonPower = 1;
    velocity[0] *= cannonPower || 1;
    velocity[1] *= cannonPower || 1;
    velocity = rotate(0, 0, velocity[0], velocity[1], angle > 90 && angle < 180 ? -angle : angle);

    var cannonProjection = document.getElementById('cannon-projection');
    var projVelocity = [velocity[0], velocity[1]];
    var pathPoints = [point.slice()];

    for(var i=0; i<200; i++) {
        projVelocity[0] += WIND / 5;
        projVelocity[1] += GRAVITY / 5;
        point[0] += projVelocity[0] / 5;
        point[1] += projVelocity[1] / 5;
        if(point[0] < -500 || point[0] > 1800) break;
        if(point[1] < -500 || point[1] > 1800) break;
        if(i % 5 === 0)
            pathPoints.push(point.slice());
    }

    cannonProjection.setAttributeNS(null, "d", 'M' + pathPoints.join('L') );

    var uiTarget = document.getElementById('ui-cannon-' + tankElement.getAttribute('id')) || document;

    var uiAngleValue = uiTarget.getElementsByClassName('ui-cannon-angle-value');
    for(i=0; i<uiAngleValue.length; i++)
        uiAngleValue[i].setAttribute('transform', 'rotate(' + (90 - cannonAngle) + ' 120 300)')

    var uiAngleTextValue = uiTarget.getElementsByClassName('ui-cannon-angle-text-value');
    for(i=0; i<uiAngleTextValue.length; i++)
        uiAngleTextValue[i].innerHTML = 'Angle: ' + Math.round(cannonAngle) + '°';

    var uiPowerValue = uiTarget.getElementsByClassName('ui-cannon-power-value');
    for(i=0; i<uiPowerValue.length; i++)
        uiPowerValue[i].setAttribute('height', cannonPower * 100 + 'px');

    var uiPowerTextValue = uiTarget.getElementsByClassName('ui-cannon-power-text-value');
    for(i=0; i<uiPowerTextValue.length; i++)
        uiPowerTextValue[i].innerHTML = 'Power: ' + Math.round(cannonPower * 100) + '%';

}

function fireCannon(tankElement, cannonAngle, cannonPower) {

    if(tankElement.nodeName.toLowerCase() === 'use')
        tankElement = replaceUseWithSource(tankElement);

    //explodeAt(point[0], point[1], tankBB.height/2);
    aimCannon(tankElement, cannonAngle, cannonPower);

    var spriteGroup = document.getElementById('sprites') || tankElement.parentNode;

    var tankBB = tankElement.getBoundingClientRect();
    var tankMatrix = tankElement.transform.baseVal.getItem(0).matrix;
    var angle = (360 + Math.round(Math.atan2(tankMatrix.b, tankMatrix.a) * (180/Math.PI))) % 360;

    if(cannonAngle) {
        if(cannonAngle<0 || cannonAngle>270) cannonAngle = 0;
        if(cannonAngle>70) cannonAngle = 70;
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

    projectile.setAttributeNS(svgns, 'xlink:href', '#projectile-template');
    projectile.href.baseVal = '#projectile-template';


    var scaleX = Math.sqrt(tankMatrix.a * tankMatrix.a + tankMatrix.b * tankMatrix.b);
    var scaleY = Math.sqrt(tankMatrix.c * tankMatrix.c + tankMatrix.d * tankMatrix.d);

    projectile.setAttribute('transform', 'translate(' + point[0] + ', ' + point[1] + ') rotate(' + 0 + ') scale(' + scaleX + ', ' + scaleY + ')');

    projectile.classList.add('projectile');
    projectile.sourceTank = tankElement;
    spriteGroup.insertBefore(projectile, spriteGroup.firstChild);

    var velocity = CANNON_VELOCITY.slice();

    if(cannonPower < 0.1) cannonPower = 0.1;
    if(cannonPower > 1) cannonPower = 1;
    velocity[0] *= cannonPower || 1;
    velocity[1] *= cannonPower || 1;

    //var pt = document.rootElement.createSVGPoint();
    //pt.x = velocity[0];
    //pt.y = velocity[1];
    //pt = pt.matrixTransform(tankMatrix);

    if(tankElement.classList.contains('flipped'))
        angle += 180;

    velocity = rotate(0, 0, velocity[0], velocity[1], angle > 90 && angle < 180 ? -angle : angle);
    projectile.vx = velocity[0];
    projectile.vy = velocity[1];

}


function detonateProjectile(projectile, tankElement) {
    if(tankElement) {
        while(true) {
            if(!tankElement.classList || tankElement === document) 
                break;
            if(tankElement.classList.contains('tank')) {
                tankElement.vx = (tankElement.vx || 0) + projectile.vx / 4;
                tankElement.vy = (tankElement.vy || 0) + projectile.vy / 4;
                destroyTank(tankElement);
                break;
            }
            tankElement = tankElement.parentNode;
        }
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
    var paths = tankElement.querySelectorAll("*"); // ('path');

    for(var i=paths.length-1; i>=0; i--) {
        paths[i].setAttribute('class', 'tank-part nohit'); //  + element.getAttribute('class'));
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
