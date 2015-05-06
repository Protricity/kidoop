/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */

(function() {

    var RENDER_INTERVAL = 100;
    var DEFAULT_GRAVITY = 1;
    var WALL_BOUNCE_COOEFICIENT = 0.20;

    var CANNON_VELOCITY = [100,12];

    document.addEventListener('render', onRender, false);
    document.addEventListener('stats', onStats, true);
    document.addEventListener('fire', onFire, true);
    document.addEventListener('collision', onCollision, true);

    //include('Character/Tank/tank.css', document);

    function isTerrainElement(element) {
        return element.classList && element.classList.contains('terrain');
    }
    function isTankElement(element) {
        return element.classList && element.classList.contains('tank');
    }
    function isTankPart(element) {
        return element.classList && element.classList.contains('tank-part');
    }
    function isProjectileElement(element) {
        return element.classList && element.classList.contains('projectile');
    }

    function onCollision(e) {
        if(isTankPart(e.detail.withElement) || isTankPart(e.target)) {
            if(!isTerrainElement(e.target)) {
                e.preventDefault();
            }
            return;
        }
        if(isTankElement(e.target)) {
            e.detail.testPoint = function(x, y) {
                var test = isCollisionPoint(x, y, e.target);
                //explodeAt(e.target.parentNode, e.target.offsetLeft + x, e.target.offsetTop  +  y, test ? 16 : 4);
                return test;
            };
        }
        if(isProjectileElement(e.detail.withElement)) {
            var projectile = e.detail.withElement;
            if(isTankElement(e.target)) {
                var tank = e.target;
                if(projectile.sourceTank === tank) {
                    e.preventDefault();
                } else {
                    e.detail.onCollisionPoint = function(x, y) {
                        detonateProjectile(projectile, tank);
                    };
                }
            } else {
                e.detail.onCollisionPoint = function(x, y) {
                    detonateProjectile(projectile, e.target);
                };
            }
        }
    }

    function onFire(e) {
        if(!isTankElement(e.target))
            return;

        var tank = e.target;
    //     explodeAt(e.target.parentNode, Math.random() * 500, Math.random() * 500, Math.random() * 200);


        if(e.detail.clickEvent && e.detail.clickEvent.target == tank.parentNode) {
            var clickEvent = e.detail.clickEvent;
            var dx = clickEvent.layerX - tank.offsetLeft - tank.offsetWidth/2;
            var dy = clickEvent.layerY - tank.offsetTop - tank.offsetHeight/2;
            var d = Math.sqrt(dx*dx + dy*dy) - 100;
            if(d<0) d=0;
            var cannonAngle = (-90 + 360 + Math.atan2(dx, dy) * 180 / Math.PI) % 360;
            if(cannonAngle<0 || cannonAngle>180) cannonAngle = 0;
            if(cannonAngle>70) cannonAngle = 70;

    //         console.log(cannonAngle, (d<500?d:500)/500);
            fireCannon(tank, cannonAngle, (d<500?d:500)/500 + 0.2);
        }

        //destroyTank(e.target);
    }

    function onRender(e) {
        var tanks = e.target.getElementsByClassName('tank');
        for(var i=0; i<tanks.length; i++)
            renderElement(tanks[i], RENDER_INTERVAL);

        var tankParts = e.target.getElementsByClassName('tank-part');
        for(i=0; i<tankParts.length; i++)
            renderTankPart(tankParts[i], RENDER_INTERVAL);

        var projectiles = e.target.getElementsByClassName('projectile');
        for(i=0; i<projectiles.length; i++) {
            var velocity = getVelocity(projectiles[i]);
            var vectorAngle = (180 + 360 + Math.atan2(velocity.vy, velocity.vx) * 180 / Math.PI) % 360;
            setAngle(projectiles[i], vectorAngle);
            renderElement(projectiles[i], RENDER_INTERVAL);
        }

        var explosions = e.target.getElementsByClassName('tank-explosion');
        for(i=0; i<explosions.length; i++)
            renderExplosion(explosions[i], RENDER_INTERVAL);
    }

    function onStats(e) {
        if(!isTankElement(e.target))
            return;
    //         e.detail.stats.tank = {
    //             data: 'data'
    //         }
    }

    function renderTankPart(element, duration) {
        renderElement(element, duration);

        var position = getPosition(element);
        if(Math.random() > 0.90) {
            explodeAt(element.parentNode, position.x + Math.random() * element.offsetWidth, position.y + Math.random() * element.offsetHeight, Math.random()*10);
            if (Math.random() > 0.92)
                element.parentNode.removeChild(element);
        }
    }

    function renderExplosion(element) {
        if(!element.offsetWidth || !element.offsetHeight) {
            element.parentNode.removeChild(element);
            return;
        }

        //addAngle(element, element._vangle);
        var a = getAcceleration(element.parentNode);
        var p = getPosition(element);

        if(a.ax || a.ay) {
            p.x = (p.x || 0) + a.ax * RENDER_INTERVAL / 1000;
            p.y = (p.y || 0) - a.ay * RENDER_INTERVAL / 1000;
            setPosition(element, p.x, p.y);
        }
    }


    function detonateProjectile(projectile, targetElement) {
        if(targetElement && isTankElement(targetElement)) {
            var pv = getVelocity(projectile);
            var tv = getVelocity(targetElement);
            setVelocity(targetElement, tv.vx + pv.vx / 4, tv.vy + pv.vy / 4);
            destroyTank(targetElement);
        }
        var x = projectile.offsetLeft + projectile.offsetWidth/2;
        var y = projectile.offsetTop + projectile.offsetHeight/2;

        var fontSize = parseFloat(window.getComputedStyle(projectile, null).getPropertyValue('font-size'));

        explodeAt(projectile.parentNode, x, y, fontSize);
        projectile.parentNode.removeChild(projectile);
    }

    function destroyTank(tankElement) {
        var svgDoc = CONFIG.documents[0];
        var svg = svgDoc.getElementsByTagName('svg')[0];
        var paths = svg.getElementsByTagName('path');

        var velocity = getVelocity(tankElement);

        var fontSize = parseFloat(window.getComputedStyle(tankElement, null).getPropertyValue('font-size'));

        var matrix = tankElement.transform.baseVal.getItem(0).matrix;

        for(var i=0; i<paths.length; i++) {
            var newSVG = svg.cloneNode();
            newSVG.setAttribute('width', tankElement.offsetWidth);
            newSVG.setAttribute('height', tankElement.offsetHeight);
            //var newPaths = newSVG.getElementsByTagName('g')[0].children;
            newSVG.appendChild(paths[i].cloneNode());

            var tankPart = tankElement.ownerDocument.createElement('div');
            tankPart.setAttribute('class', 'tank-part'); //  + element.getAttribute('class'));

            tankPart.appendChild(newSVG);
            tankElement.parentNode.appendChild(tankPart);
            tankPart.setAttribute('style', 'transform: matrix(' + matrix.a + ', ' + matrix.b + ', ' + matrix.c + ', ' + matrix.d + ', ' + matrix.e + ', ' + matrix.f + ')');
            tankPart.style.left = tankElement.offsetLeft + 'px';
            tankPart.style.top = tankElement.offsetTop + 'px';
            tankPart.style.width = tankElement.offsetWidth + 'px';
            tankPart.style.height = tankElement.offsetHeight + 'px';

            //var position = getPosition(element);
            //setPosition(tankPart, position.x, position.y);
            //setAngle(tankPart, getAngle(element));


            setAngleVelocity(tankPart, Math.random() * 8 - 4);
            setVelocity(tankPart, velocity.vx + Math.random() * 60 - 30, velocity.vy + Math.random() * 60 - 30);
        }

        tankElement.parentNode.removeChild(tankElement);
    }

    var explodeContainer = null;
    function explodeAt(container, x, y, size) {
        if(!size) size = 32;
        size *= 5;
        if(!explodeContainer)
            explodeContainer = container.getElementsByClassName('tank-explosion-container').item(0);
        if(!explodeContainer) {
            explodeContainer = container.ownerDocument.createElement('div');
            explodeContainer.classList.add('tank-explosion-container');
            container.appendChild(explodeContainer);
        }

        var explosion = explodeContainer.ownerDocument.createElement('div');
        explosion.classList.add('tank-explosion');
        explodeContainer.appendChild(explosion);
        explosion.setAttribute('style', 'font-size: ' + size + 'px;');
        //explosion.style.left = x - explosion.offsetWidth/2;
        //explosion.style.top = y - explosion.offsetHeight/2;
        explosion.setAttribute('style', 'font-size: ' + size + 'px;left: ' + (x - explosion.offsetWidth/2) + 'px; top: ' + (y - explosion.offsetHeight/2) + 'px; ');

    }

})();