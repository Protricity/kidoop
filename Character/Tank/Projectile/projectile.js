/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var RENDER_INTERVAL = 100;
var DEFAULT_GRAVITY = 5;
var WALL_BOUNCE_COOEFICIENT = 0.20;

//var svgDoc = document.getElementsByTagName('svg')[0];
var projectileElm = (function() {
    var objects = window.top.document.getElementsByTagName('object');
    for(var i=0; i<objects.length; i++) {
        if(objects[i].contentDocument === document) {
            return objects[i];
        }
    }
    throw new Error("Container element not found for ", document);
})();
projectileElm.addEventListener('render', onRender, false);
projectileElm.addEventListener('stats', onStats, true);
projectileElm.addEventListener('collision', onCollision, true);

var testCache = [];
function isCollisionPoint(x, y) {
    var i = x + y * projectileElm.offsetWidth;
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

function onRender(e) {
    var parentElement = (e.detail || {}).parentElement;
    if(!parentElement)
        return;
    if(!projectileElm)
        projectileElm = parentElement;
    //var rect = svgDoc.getBBox();
    //console.log(projectileElm, rect);

    var time = new Date();
    var totalElapsedTime = time - (projectileElm.lastRender || new Date());
    if(totalElapsedTime > RENDER_INTERVAL || totalElapsedTime < 0)
        totalElapsedTime = RENDER_INTERVAL;
    projectileElm.lastRender = time;

    var v = getVelocity(projectileElm);
    var p = getPosition(projectileElm);
    var a = getAcceleration(projectileElm);
    if(a.ax || a.ay) {
        v.vx = (v.vx || 0) + a.ax * totalElapsedTime / 1000;
        v.vy = (v.vy || 0) + a.ay * totalElapsedTime / 1000;
        setVelocity(projectileElm, v.vx, v.vy);
    }

    p.x += v.vx;
    p.y += v.vy;
    setPosition(projectileElm, p.x, p.y);

    var siblings = projectileElm.parentNode.children;
    for(var k=0; k<siblings.length; k++) {
        var sibling = siblings[k];
        testCollision(projectileElm, sibling);
    }
    testRectContainment(projectileElm, projectileElm.parentNode);

    p = getPosition(projectileElm);
    setPosition(projectileElm, p.x, p.y);
    //render(projectileElm);

    var angleVelocity = getAngleVelocity(projectileElm);
    if(angleVelocity) {
        var angle = getAngle(projectileElm);
        angle += angleVelocity;
        setAngle(projectileElm, angle);
    }
}

function onStats(e) {
//         e.detail.stats.tank = {
//             data: 'data'
//         }
}

