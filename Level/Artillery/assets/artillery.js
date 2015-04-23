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

function renderTankPart(element, duration) {
    testRectContainment(element);
}

function renderProjectile(projectile, duration) {
    if(duration > RENDER_INTERVAL_MAX)
        duration = RENDER_INTERVAL_MAX;

    projectile.vx = (projectile.vx || 0) + WIND * duration / 1000;
    projectile.vy = (projectile.vy || 0) + GRAVITY * duration / 1000;

    //var x = parseFloat(projectile.getAttribute('x')) || 0;
    //var y = parseFloat(projectile.getAttribute('y')) || 0;
    //x += projectile.vx * duration / 1000;
    //y += projectile.vy * duration / 1000;
    //projectile.setAttribute('x', x);
    //projectile.setAttribute('y', y);


    var bb = projectile.getBoundingClientRect();
    var x = bb.left;
    var y = bb.top;

    try {
        var svgTransform = projectile.transform.baseVal[0];
        var matrix = svgTransform.matrix;
        x = matrix.e;
        y = matrix.f;
    } catch (e) {

    }

    x += projectile.vx * duration / 1000;
    y += projectile.vy * duration / 1000;

    //var curAngle = (360 + Math.round(Math.atan2(matrix.b, matrix.a) * (180/Math.PI))) % 360;
    var vectorAngle = (180 + Math.atan2(projectile.vy, projectile.vx) * 180 / Math.PI) % 360;
    projectile.setAttribute('transform', 'translate(' + x + ', ' + y + ') rotate(' + vectorAngle + ')');


    //var position = [bb.left+bb.width/2, bb.top+bb.height/2];
    //position[0] += projectile.vx * duration / 1000;
    //position[1] += projectile.vy * duration / 1000;
    //svgTransform.setTranslate(position[0], position[1]);

    //svgTransform.setMatrix(svgTransform.matrix.translate(
    //    projectile.vx * duration / 1000,
    //    projectile.vy * duration / 1000
    //));

    //testRectContainment(projectile);

    //svgTransform.setRotate(vectorAngle, bb.width/2, bb.height/2);
    //svgTransform.setMatrix(svgTransform.matrix.rotate(curAngle < vectorAngle ? 1 : -1)); // curAngle < vectorAngle ? 1 : -1));
    //svgTransform.setMatrix(svgTransform.matrix.rotate(vectorAngle, bb.width/2, bb.height/2));

    var collisionElement = document.elementFromPoint((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);
    if(collisionElement === null) {
        console.error('null projectile', projectile);
        detonateProjectile(projectile);
        return;
    }
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
            if(collisionElement.classList.contains('tank')) {
                if(projectile.sourceTank !== collisionElement) {
                    detonateProjectile(projectile, collisionElement);
                }
            }
            break;

        default:
            console.error('unknown collision element: ', collisionElement, projectile);
            detonateProjectile(projectile);
            break;
    }

}


function renderExplosion(element) {
    if(!element.offsetWidth || !element.offsetHeight) {
        element.parentNode.removeChild(element);
        return true;
    }
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

    var explosions = e.target.getElementsByClassName('tank-explosion');
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

    //point = transform(point[0], point[1], tankMatrix.a, tankMatrix.b, tankMatrix.c, tankMatrix.d, tankMatrix.e, tankMatrix.f);
//     point[0] += tankBB.width/2;
//     point[1] += tankBB.height/2;

//     point[0] += 200;

    //point = transformXYInto(element, point[0] - element.offsetWidth/2, point[1] - element.offsetHeight/2);

//     point[0] += tankBB.left;
//     point[1] += tankBB.top;


    var xmlns = "http://www.w3.org/2000/svg";
    var svgns = 'http://www.w3.org/2000/xlink/namespace/';
    var projectile = tankElement.ownerDocument.createElementNS(xmlns, 'use');

    projectile.setAttributeNS(svgns,'xlink:href','#projectile-template');
    projectile.href.baseVal = '#projectile-template';

    projectile.setAttribute('transform', '');    projectile.setAttribute('transform', 'translate(' + point[0] + ', ' + point[1] + ') rotate(' + 0 + ')');

    //projectile.setAttribute('x', point[0]+'');
    //projectile.setAttribute('y', point[1]+'');
    //projectile.setAttribute('width', '100%');
    //projectile.setAttribute('height', '100%');

    projectile.classList.add('projectile');
    projectile.sourceTank = tankElement;
    spriteGroup.appendChild(projectile);

    //var fontSize = parseFloat(window.getComputedStyle(tankElement, null).getPropertyValue('font-size'));

    //projectile.setAttribute('style','font-size: ' + fontSize + 'px; left: ' + (point[0] - projectile.offsetWidth/2) + 'px; top: ' +  (point[1] - projectile.offsetHeight/2) + 'px; transform: rotate(' + angle + 'deg);');

    var velocity = CANNON_VELOCITY.slice();
    velocity[0] *= power || 1;
    velocity[1] *= power || 1;
    velocity = rotate(0, 0, velocity[0], velocity[1], angle);
    projectile.vx = velocity[0];
    projectile.vy = velocity[1];


    explodeAt(point[0], point[1], tankBB.height/2);
}


function detonateProjectile(projectile, tankElement) {
    if(tankElement) {
        tankElement.vx = (tankElement.vx || 0) + projectile.vx / 4;
        tankElement.vy = (tankElement.vy || 0) + projectile.vy / 4;
        destroyTank(tankElement);
    }
    var x = projectile.offsetLeft + projectile.offsetWidth/2;
    var y = projectile.offsetTop + projectile.offsetHeight/2;

    var fontSize = parseFloat(window.getComputedStyle(projectile, null).getPropertyValue('font-size'));

    explodeAt(projectile.parentElement, x, y, fontSize);
    projectile.parentElement.removeChild(projectile);
}

function destroyTank(element) {
    var svgDoc = CONFIG.documents[0];
    var svg = svgDoc.getElementsByTagName('svg')[0];
    var paths = svg.getElementsByTagName('path');

    var velocity = getVelocity(element);

    var fontSize = parseFloat(window.getComputedStyle(element, null).getPropertyValue('font-size'));

    var transValues = getTransformValues(element);

    for(var i=0; i<paths.length; i++) {
        var newSVG = svg.cloneNode();
        newSVG.setAttribute('width', element.offsetWidth);
        newSVG.setAttribute('height', element.offsetHeight);
        //var newPaths = newSVG.getElementsByTagName('g')[0].children;
        newSVG.appendChild(paths[i].cloneNode());

        var tankPart = element.ownerDocument.createElement('div');
        tankPart.setAttribute('class', 'tank-part'); //  + element.getAttribute('class'));

        tankPart.appendChild(newSVG);
        element.parentNode.appendChild(tankPart);
        tankPart.setAttribute('style', 'transform: matrix(' + transValues.join(', ') + ')');
        tankPart.style.left = element.offsetLeft + 'px';
        tankPart.style.top = element.offsetTop + 'px';
        tankPart.style.width = element.offsetWidth + 'px';
        tankPart.style.height = element.offsetHeight + 'px';

        //var position = getPosition(element);
        //setPosition(tankPart, position.x, position.y);
        //setAngle(tankPart, getAngle(element));


        setAngleVelocity(tankPart, Math.random() * 8 - 4);
        setVelocity(tankPart, velocity.vx + Math.random() * 60 - 30, velocity.vy + Math.random() * 60 - 30);
    }

    element.parentNode.removeChild(element);
}

var explodeContainer = null;
function explodeAt(x, y, size) {
    var spriteGroup = document.getElementById('sprites');

    var explosion = spriteGroup.ownerDocument.createElement('use');
    explosion.setAttribute('xlink:href', '#explosion');
    //explosion.setAttribute('transform', 'matrix(' + transValues.join(', ') + ')');
    explosion.classList.add('tank-explosion');
    spriteGroup.appendChild(explosion);

    //explosion.setAttribute('style', 'font-size: ' + size + 'px;');
    //explosion.style.left = x - explosion.offsetWidth/2;
    //explosion.style.top = y - explosion.offsetHeight/2;
    //explosion.setAttribute('style', 'font-size: ' + size + 'px;left: ' + (x - explosion.offsetWidth/2) + 'px; top: ' + (y - explosion.offsetHeight/2) + 'px; ');

}

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

function transform(x, y, a, b, c, d, e, f) {
    return [
        x * a + y * c + e,
        x * b + y * d + f
    ];
}

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return [nx, ny];
}
