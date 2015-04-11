/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var RENDER_INTERVAL = 100;
var DEFAULT_GRAVITY = 5;
var WALL_BOUNCE_COOEFICIENT = 0.20;

//var svgDoc = document.getElementsByTagName('svg')[0];
var tankElm = (function() {
    var objects = window.top.document.getElementsByTagName('object');
    for(var i=0; i<objects.length; i++) {
        if(objects[i].contentDocument === document) {
            return objects[i];
        }
    }
    throw new Error("Container element not found for ", document);
})();
tankElm.addEventListener('render', onRender, false);
tankElm.addEventListener('stats', onStats, true);
tankElm.addEventListener('fire', onFire, true);
tankElm.addEventListener('collision', onCollision, true);

var testCache = [];
function isCollisionPoint(x, y) {
    var i = x + y * tankElm.offsetWidth;
    if(typeof testCache[i] === 'boolean')
        return testCache[i];

    var test = !!document.elementFromPoint(x, y);
    console.log("Test: ", [x, y, test]);
    testCache[i] = test;
    return test;
}

function onCollision(e) {
    e.detail.isCollisionPoint = isCollisionPoint;
}

function onFire(e) {
    var angle = getAngle(e.target);
    console.log(e, angle);
    // <object data="Character/Tank/Projectile/projectile.svg" class="projectile stats" data-vy="-20" type="image/svg+xml"></object>
}

function onRender(e) {
    var parentElement = (e.detail || {}).parentElement;
    if(!parentElement)
        return;
    if(!tankElm)
        tankElm = parentElement;
    //var rect = svgDoc.getBBox();
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
}

function onStats(e) {
//         e.detail.stats.tank = {
//             data: 'data'
//         }
}

