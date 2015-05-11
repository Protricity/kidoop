/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var RENDER_INTERVAL_MAX = 1000;
var RENDER_INTERVAL = 100;
var WALL_BOUNCE_COOEFICIENT = 0.20;

var CANNON_VELOCITY = [500,0];

var GRAVITY = 16;
var WIND = 0;

document.addEventListener('render', renderArtilleryElements, false);
//document.addEventListener('stats', onStats, true);
document.addEventListener('fire', onFire, true);
document.addEventListener('aim', onAim, true);
//document.addEventListener('collision', onCollision, true);

function testRectContainment(element) {
}


function testHitBox(element, orClass) {
    while(element) {
        if(element.classList.contains('hit-box'))
            return element;
        if(orClass && element.classList.contains(orClass))
            return element;
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
    var transform = useElement.getAttribute('transform');
    if(transform) 
        templateElement.setAttribute('transform', transform);
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

    if(tankPart.transform.baseVal.length === 0)
        tankPart.setAttribute('transform', '');
    var svgTransform = tankPart.transform.baseVal.getItem(0);
    var matrix = svgTransform.matrix;

    matrix.e += tankPart.vx * duration / 1000;
    matrix.f += tankPart.vy * duration / 1000;
    svgTransform.setMatrix(matrix.rotate(tankPart.va * duration / 1000));

    var bb = tankPart.getBoundingClientRect();
    var collisionElement = document.elementFromPoint((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);

    if(testHitBox(collisionElement) || bb.bottom > 600) {
        tankPart.parentNode.removeChild(tankPart);
        explodeAt((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2);
    }

    testRectContainment(tankPart);
}

var transformRegex = /^translate\(([^)]+)\) rotate\(([^)]+)\) scale\(([^)]+)\)$/;

function renderProjectile(projectile, duration) {
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

    if(collisionElement = testHitBox(collisionElement, 'enemy') || bb.bottom > 600)
        detonateProjectile(projectile, collisionElement);
}


function renderExplosion(explosion, duration) {
    explosion.vx = (explosion.vx || 0) + WIND * duration / 1000;
    explosion.vy = (explosion.vy || 0) + -GRAVITY * duration / 1000;

    if(explosion.transform.baseVal.length === 0)
        explosion.setAttribute('transform', '');
    var svgTransform = explosion.transform.baseVal.getItem(0);
    var matrix = svgTransform.matrix;

    matrix.e += explosion.vx * duration / 1000;
    matrix.f += explosion.vy * duration / 1000;
    //matrix = matrix.rotate(explosion.va * duration / 1000);
    svgTransform.setMatrix(matrix);

    if(matrix.f > 600 || matrix.f < 0)
        explosion.parentNode.removeChild(explosion);
}

var lastRender = new Date().getTime();
function renderArtilleryElements(e) {
    var duration = (new Date().getTime() - lastRender);
    if(duration < RENDER_INTERVAL) duration = RENDER_INTERVAL;
    if(duration > RENDER_INTERVAL_MAX) duration = RENDER_INTERVAL_MAX;
//console.log('duration: ', duration);


    var tanks = document.getElementsByClassName('tank'); //, '*', e.target);
    for(var i=0; i<tanks.length; i++)
        renderTank(tanks[i], duration);

    var projectiles = document.getElementsByClassName('projectile'); //, '*', e.target);
    for(i=0; i<projectiles.length; i++)
        renderProjectile(projectiles[i], duration);

    var tankParts = document.getElementsByClassName('tank-part'); //, '*', e.target);
    for(i=0; i<tankParts.length; i++)
        renderTankPart(tankParts[i], duration);

    var explosions = document.getElementsByClassName('explosion'); //, '*', e.target);
    for(i=0; i<explosions.length; i++)
        renderExplosion(explosions[i], duration);
}

function onFire(e) {
    var tankElement = e.target;
    if(tankElement.nodeName.toLowerCase() === 'use')
        tankElement = replaceUseWithSource(tankElement);
    var cannonBody = getElementsByClassName('cannon-body', '*', tankElement)[0];
    if(e.detail.flipped) {
        tankElement.classList.add('flipped');
        cannonBody.setAttribute('transform', 'scale(-1,1)');
    } else {
        tankElement.classList.remove('flipped');
        cannonBody.setAttribute('transform', 'scale(1,1)');
    }
    fireCannon(tankElement, e.detail.angle, e.detail.power);
}

function onAim(e) {
//     if(e.target.classList.contains('flipped') !== e.detail.flipped)
//         e.detail.flipped ? e.target.classList.add('flipped') : e.target.classList.remove('flipped');
    aimCannon(e.target, e.detail.angle, e.detail.power);
}

function aimCannon(tankElement, cannonAngle, cannonPower) {
    if(tankElement.nodeName.toLowerCase() === 'use')
        tankElement = replaceUseWithSource(tankElement);

    var tankBB = tankElement.getBoundingClientRect();
    var tankMatrix = tankElement.transform.baseVal.getItem(0).matrix;

    var scaleX = Math.sqrt(tankMatrix.a * tankMatrix.a + tankMatrix.b * tankMatrix.b);
    var scaleY = Math.sqrt(tankMatrix.c * tankMatrix.c + tankMatrix.d * tankMatrix.d);

    var point = [(tankBB.right + tankBB.left) / 2, (tankBB.bottom + tankBB.top) / 2];
    var cannonTip = getElementsByClassName('cannon-tip', '*', tankElement)[0];

    if(cannonAngle) {
        if(cannonAngle<0 || cannonAngle>270) cannonAngle = 0;
        if(cannonAngle>70) cannonAngle = 70;
        var cannonRotate = getElementsByClassName('cannon-rotate', '*', tankElement)[0];
        cannonRotate.setAttribute('transform', 'rotate(' + -cannonAngle + ')');
    }

    if(cannonTip) {
        var bb = cannonTip.getBoundingClientRect();
        point = [(bb.right + bb.left) / 2, (bb.bottom + bb.top) / 2];
    }
    var cannonBase = getElementsByClassName('cannon-base', '*', tankElement)[0];

    var velocity = CANNON_VELOCITY.slice();
    if(cannonBase) {
        var bb2 = cannonBase.getBoundingClientRect();
        var point2 = [(bb2.right + bb2.left) / 2, (bb2.bottom + bb2.top) / 2];
        var imp = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
        velocity = [point[0] - point2[0], point[1] - point2[1]];
        var imp2 = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
        velocity[0] *= imp/imp2;
        velocity[1] *= imp/imp2;
    }

    if(cannonPower < 0.1) cannonPower = 0.1;
    if(cannonPower > 1) cannonPower = 1;
    velocity[0] *= cannonPower || 1;
    velocity[1] *= cannonPower || 1;
    velocity[0] *= scaleX || 1;
    velocity[1] *= scaleY || 1;

    var cannonProjection = document.getElementById('cannon-projection');
    var projVelocity = [velocity[0], velocity[1]];
    var pathPoints = [point.slice()];

    for(var i=0; i<200; i++) {
        projVelocity[0] += WIND * 0.2;
        projVelocity[1] += GRAVITY * 0.2;
        point[0] += projVelocity[0] * 0.2;
        point[1] += projVelocity[1] * 0.2;
        if(point[0] < -500 || point[0] > 1800) break;
        if(point[1] < -500 || point[1] > 1800) break;
//         if(i % 10 === 0)
            pathPoints.push(point.slice());
    }

    cannonProjection.setAttributeNS(null, "d", 'M' + pathPoints.join('L') );

    var uiTarget = document.getElementById('ui-cannon-' + tankElement.getAttribute('id')) || document;

    var uiAngleValue = getElementsByClassName('ui-cannon-angle-value', '*', uiTarget);
    for(i=0; i<uiAngleValue.length; i++)
        uiAngleValue[i].setAttribute('transform', 'rotate(' + (90 - cannonAngle) + ' 120 300)')

    var uiAngleTextValue = getElementsByClassName('ui-cannon-angle-text-value', '*', uiTarget);
    for(i=0; i<uiAngleTextValue.length; i++)
        uiAngleTextValue[i].innerHTML = 'Angle: ' + Math.round(cannonAngle) + '°';

    var uiPowerValue = getElementsByClassName('ui-cannon-power-value', '*', uiTarget);
    for(i=0; i<uiPowerValue.length; i++)
        uiPowerValue[i].setAttribute('height', cannonPower * 100 + 'px');

    var uiPowerTextValue = getElementsByClassName('ui-cannon-power-text-value', '*', uiTarget);
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

    var point = [(tankBB.right + tankBB.left) / 2, (tankBB.bottom + tankBB.top) / 2];
    var cannonTip = getElementsByClassName('cannon-tip', '*', tankElement)[0];

    if(cannonTip) {
        var bb = cannonTip.getBoundingClientRect();
        point = [(bb.right + bb.left) / 2, (bb.bottom + bb.top) / 2];
    }
    var cannonBase = getElementsByClassName('cannon-base', '*', tankElement)[0];

    var velocity = CANNON_VELOCITY.slice();
    if(cannonBase) {
        var bb2 = cannonBase.getBoundingClientRect();
        var point2 = [(bb2.right + bb2.left) / 2, (bb2.bottom + bb2.top) / 2];
        var imp = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
        velocity = [point[0] - point2[0], point[1] - point2[1]];
        var imp2 = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
        velocity[0] *= imp/imp2;
        velocity[1] *= imp/imp2;
    }

    var xmlns = "http://www.w3.org/2000/svg";
    var svgns = 'http://www.w3.org/2000/xlink/namespace/';
    var projectile = tankElement.ownerDocument.createElementNS(xmlns, 'use');

    projectile.setAttributeNS(svgns, 'xlink:href', '#projectile-template');
    projectile.href.baseVal = '#projectile-template';
    spriteGroup.insertBefore(projectile, spriteGroup.firstChild);

//     projectile = replaceUseWithSource(projectile);

//     projectile.innerHTML = '<animateTransform'
//                       + ' xmlns="http://www.w3.org/2000/svg" attributeType="XML"'
//                       + ' attributeName="transform"'
//                       + ' type="scale" from="1" to="0.8"'
//                       + ' begin="0s" dur="0.5s"'
//                       + ' repeatCount="indefinite"/>"';



    var scaleX = Math.sqrt(tankMatrix.a * tankMatrix.a + tankMatrix.b * tankMatrix.b);
    var scaleY = Math.sqrt(tankMatrix.c * tankMatrix.c + tankMatrix.d * tankMatrix.d);

    projectile.setAttribute('transform', 'translate(' + point[0] + ', ' + point[1] + ') rotate(' + 0 + ') scale(' + scaleX + ', ' + scaleY + ')');

    projectile.classList.add('projectile');
    projectile.sourceTank = tankElement;


    if(cannonPower < 0.1) cannonPower = 0.1;
    if(cannonPower > 1) cannonPower = 1;
    velocity[0] *= cannonPower || 1;
    velocity[1] *= cannonPower || 1;
    velocity[0] *= scaleX || 1;
    velocity[1] *= scaleY || 1;

    //var pt = document.rootElement.createSVGPoint();
    //pt.x = velocity[0];
    //pt.y = velocity[1];
    //pt = pt.matrixTransform(tankMatrix);

//     if(tankElement.classList.contains('flipped'))
//         angle += 180;

//     velocity = rotate(0, 0, velocity[0], velocity[1], angle > 90 && angle < 180 ? -angle : angle);
    projectile.vx = velocity[0];
    projectile.vy = velocity[1];

}


function detonateProjectile(projectile, tankElement) {
    if(tankElement) {
        while(true) {
            if(!tankElement.classList || tankElement === document) 
                break;
            if(tankElement.classList.contains('tank') && !tankElement.classList.contains('usertank')) {
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


    var attrTransform = projectile.getAttribute('transform');
    var match = transformRegex.exec(attrTransform);
    var scale = match ? match[3] : 1;

    explodeAt(x, y, scale);
    projectile.parentNode.removeChild(projectile);
}

function destroyTank(tankElement) {
    if(!tankElement.classList.contains('tank'))
        throw new Error("Not a tank: ", tankElement);
    var parent = tankElement.parentNode;
    var paths = tankElement.querySelectorAll("*"); // ('path');

    var i = 0;
    var interval = setInterval(function() {

        var container = paths[i]; // document.createElement('g');

        container.setAttribute('class', 'tank-part nohit'); //  + element.getAttribute('class'));
        container.setAttribute('transform', tankElement.getAttribute('transform'));
        //container.setAttribute('style', tankElement.getAttribute('style'));

        container.va = (tankElement.va || 0) + Math.random() * 60 - 30;
        container.vx = (tankElement.vx || 0) + Math.random() * 60 - 30;
        container.vy = (tankElement.vy || 0) + Math.random() * 60 - 50;
        container.sourceTank = tankElement;

        parent.appendChild(container);

        i++;

        if(i >= paths.length-1 || !paths[i]) {
            clearInterval(interval);
            if(tankElement.parentNode)
                tankElement.parentNode.removeChild(tankElement);
            return;
        }
        var bb = paths[i].getBoundingClientRect();
        explodeAt((bb.left + bb.right) / 2, (bb.top + bb.bottom) / 2, Math.random());
    }, 80);

}

function breakIntoQuarters(element) {
    if(typeof element.length == 'number') {
        var elements = [].slice.call(element);
        var groups = [];
        for(var ei=0; ei<elements.length; ei++)
            groups[ei] = breakIntoQuarters(elements[ei]);
        return groups;
    }
    var bb = element.getBoundingClientRect();
    var parent = element.parentNode;
    var TL = element.cloneNode(true);
    var TR = element.cloneNode(true);
    var BL = element.cloneNode(true);
    var BR = element.cloneNode(true);
    var parts = [TL, TR, BL, BR];
    //var match = transformRegex.exec(element);
    //var scale = match ? match[3] : 1;

    var w = (bb.width / 2);
    var h = (bb.height / 2);
    var transform = element.getAttribute('transform') || '';
    TL.setAttribute('transform', 'scale(0.5) translate(' + -w + ', ' + h + ') ' + transform);
    TR.setAttribute('transform', 'scale(0.5) translate(' + w + ', ' + h + ') ' + transform);
    BL.setAttribute('transform', 'scale(0.5) translate(' + -w + ', ' + -h + ') ' + transform);
    BR.setAttribute('transform', 'scale(0.5) translate(' + w + ', ' + -h + ') ' + transform);

    for(var i=0; i<parts.length; i++) {
        parts[i].setAttribute('id', element.getAttribute('id') + '-' + i);
        parent.insertBefore(parts[i], element);
    }

    parent.removeChild(element);

    return parts;
}

function explodeAt(x, y, size) {
    if(!size) size = 2;
    var spriteGroup = document.getElementById('sky');

    var explosionElement = document.getElementById('explosion-template').cloneNode(true);

    explosionElement.classList.add('explosion');
    explosionElement.setAttribute('transform', 'translate(' + x + ', ' + y + ') scale(' + size + ')');
    spriteGroup.appendChild(explosionElement);

    var animateTransform = document.createElement('animateTransform');
    animateTransform.setAttribute('attributeType', 'xml');
    animateTransform.setAttribute('attributeName', 'r');
    animateTransform.setAttribute('from', '0');
    animateTransform.setAttribute('to', '20');
    animateTransform.setAttribute('dur', '5s');
    animateTransform.setAttribute('repeatCount', 'indefinite');

    startAnimation(explosionElement);
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


function startAnimation(element) {
    if(element.beginElement)
        element.beginElement();
    for(var i=0; i<element.childNodes.length; i++)
        startAnimation(element.childNodes[i]);

}

// Minify

var getElementsByClassName = function (className, tag, elm){
    if (SVGElement.prototype.getElementsByClassName) {
        getElementsByClassName = function (className, tag, elm) {
            elm = elm || document;
            var elements = elm.getElementsByClassName(className),
                nodeName = (tag)? new RegExp("\b" + tag + "\b", "i") : null,
                returnElements = [],
                current;
            for(var i=0, il=elements.length; i<il; i+=1){
                current = elements[i];
                if(tag === '*' || !nodeName || nodeName.test(current.nodeName)) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    else if (document.evaluate) {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = "",
                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                returnElements = [], elements, node;
            for(var j=0, jl=classes.length; j<jl; j+=1){
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
            }
            catch (e) {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
            }
            while ((node = elements.iterateNext())) {
                returnElements.push(node);
            }
            return returnElements;
        };
    }
    else {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = [],
                elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                current,
                returnElements = [],
                match;
            for(var k=0, kl=classes.length; k<kl; k+=1){
                classesToCheck.push(new RegExp("(^|\s)" + classes[k] + "(\s|$)"));
            }
            for(var l=0, ll=elements.length; l<ll; l+=1){
                current = elements[l];
                match = false;
                for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                    match = classesToCheck[m].test(current.getAttribute('class'));
                    if (!match) {
                        break;
                    }
                }
                if (match) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    return getElementsByClassName(className, tag, elm);
};



// classList polyfill
"document"in self&&("classList"in document.createElement("_")?!function(){"use strict";var t=document.createElement("_");if(t.classList.add("c1","c2"),!t.classList.contains("c2")){var e=function(t){var e=DOMTokenList.prototype[t];DOMTokenList.prototype[t]=function(t){var n,i=arguments.length;for(n=0;i>n;n++)t=arguments[n],e.call(this,t)}};e("add"),e("remove")}if(t.classList.toggle("c3",!1),t.classList.contains("c3")){var n=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return 1 in arguments&&!this.contains(t)==!e?e:n.call(this,t)}}t=null}():!function(t){"use strict";if("Element"in t){var e="classList",n="prototype",i=t.Element[n],s=Object,r=String[n].trim||function(){return this.replace(/^\s+|\s+$/g,"")},o=Array[n].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1},a=function(t,e){this.name=t,this.code=DOMException[t],this.message=e},c=function(t,e){if(""===e)throw new a("SYNTAX_ERR","An invalid or illegal string was specified");if(/\s/.test(e))throw new a("INVALID_CHARACTER_ERR","String contains an invalid character");return o.call(t,e)},l=function(t){for(var e=r.call(t.getAttribute("class")||""),n=e?e.split(/\s+/):[],i=0,s=n.length;s>i;i++)this.push(n[i]);this._updateClassName=function(){t.setAttribute("class",this.toString())}},u=l[n]=[],f=function(){return new l(this)};if(a[n]=Error[n],u.item=function(t){return this[t]||null},u.contains=function(t){return t+="",-1!==c(this,t)},u.add=function(){var t,e=arguments,n=0,i=e.length,s=!1;do t=e[n]+"",-1===c(this,t)&&(this.push(t),s=!0);while(++n<i);s&&this._updateClassName()},u.remove=function(){var t,e,n=arguments,i=0,s=n.length,r=!1;do for(t=n[i]+"",e=c(this,t);-1!==e;)this.splice(e,1),r=!0,e=c(this,t);while(++i<s);r&&this._updateClassName()},u.toggle=function(t,e){t+="";var n=this.contains(t),i=n?e!==!0&&"remove":e!==!1&&"add";return i&&this[i](t),e===!0||e===!1?e:!n},u.toString=function(){return this.join(" ")},s.defineProperty){var h={get:f,enumerable:!0,configurable:!0};try{s.defineProperty(i,e,h)}catch(g){-2146823252===g.number&&(h.enumerable=!1,s.defineProperty(i,e,h))}}else s[n].__defineGetter__&&i.__defineGetter__(e,f)}}(self));
