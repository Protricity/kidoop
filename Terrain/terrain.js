/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var WALL_BOUNCE_COOEFICIENT = 0.40;

var svgDoc = document.getElementsByTagName('svg')[0];

function getCollisionElement(x, y) {
    var collisionElement = document.elementFromPoint(x, y);
    if(!collisionElement) return;
    if(collisionElement === document) return;
    if(collisionElement === svgDoc) return;
    return collisionElement;
}

var canvasCache = null;
var canvasData = null;

var testCache = [];
function testCollision(x, y) {

    var i = x + y * (svgDoc.offsetWidth || svgDoc.width.baseVal.value);
    if(typeof testCache[i] === 'boolean')
       return testCache[i];

    var test = !!getCollisionElement(x, y);
    //console.log("Test: ", [x, y, test]);
    testCache[i] = test;
    return test;
}

function climb(x, y) {
    if(x<0)                     x = 0;
    if(x>svgDoc.offsetWidth)    x = svgDoc.offsetWidth;
    var vy = -1;
    while(true) {
        if(!testCollision(x, y) || y < 0)
            break;
        y+=vy;
//         vy++;
    }
    return [x, y];
}

var onCollision = function(e) {
    var withElement = e.detail.withElement;
    var svgContainerElement = e.detail.svgContainerElement;
    var svgDocument = e.detail.svgDocument;
    var points = e.detail.points || [];
    var paths = svgDocument.getElementsByTagName('path');
    var dx = withElement.offsetLeft - svgContainerElement.offsetLeft;
    var dy = withElement.offsetTop - svgContainerElement.offsetTop;
    if(points.length === 0) {
        points = [];
        points.push([dx, dy]);
        points.push([dx + withElement.offsetWidth, dy]);
        points.push([dx, dy + withElement.offsetHeight]);
        points.push([dx + withElement.offsetWidth, dy + withElement.offsetHeight]);
    }

    //e.detail.collisionPoints = [];
    //for(var i=0; i<points.length; i++) {
    //    var point = points[i];
    //    if(testCollision(point[0], point[1])) {
    //        var topPoint = climb(point[0], point[1] + 1);
    //        var pushVector = [topPoint[0] - point[0], topPoint[1] - point[1]];
    //        if(e.detail.pushVector.length === 0 || pushVector[1] > e.detail.pushVector[1])
    //            e.detail.pushVector = pushVector;
    //    }
    //}

    e.detail.testCollisionPoint = testCollision;
    //function(x, y) {
        //var dx = withElement.offsetLeft - svgContainerElement.offsetLeft;
        //var dy = withElement.offsetTop - svgContainerElement.offsetTop;
        //return testCollision(x, y);
    //};
//     e.preventDefault();
    return false;
};


var onStats = function (e) {
//         e.detail.stats.tank = {
//             data: 'data'
//         }
};

var onLoad = function (e) {
    console.log("Loaded", svgDoc);
};


document.addEventListener('collision', onCollision, true);
document.addEventListener('stats', onStats, true);
document.addEventListener('load', onLoad, true);

