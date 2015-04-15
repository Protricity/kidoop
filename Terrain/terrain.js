/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var WALL_BOUNCE_COOEFICIENT = 0.40;

var CONFIG = window.top._terrain_config;
if(typeof CONFIG === 'undefined') {
    var topDoc = window.top.document;
    CONFIG = window.top._terrain_config = {
        //projectile: null,
        documents: []
    };

    topDoc.addEventListener('stats', onStats, false);
    topDoc.addEventListener('collision', onCollision, false);
    topDoc.addEventListener('compile', onCompile, false);
}
CONFIG.documents.push(document);

var svgDoc = document.getElementsByTagName('svg')[0];
function elementFromPoint(x, y) {
    var elm = document.elementFromPoint(x, y);
    if(elm === svgDoc) 
        return null;
    return elm;
}
//
//var heights = [];
//function isCollisionPoint(x, y) {
//    if(!isNaN(heights[x])) {
//        return y >= heights[x];
//    }
//
//    if(x<0 || y<0 || x>svgDoc.offsetWidth || y>svgDoc.offsetHeight)
//        return false;
//
//    var min = 0;
//    var max = svgDoc.offsetHeight;
//    var height = y;
//    while(max > min + 1) {
//        var test = !!elementFromPoint(x, height);
//        console.log("Test: ", x, height, test);
//        if (test) {
//            max = height;
//        } else {
//            min = height;
//        }
//        height = Math.floor((min + max) / 2);
//    }
//
//    heights[x] = height;
//    return y >= height;
//}
//
//function scanTerrain(x1, y1, x2, y2) {
//
//}

var height = [];
var heightMax = [];
var cacheName = document.location.href;

var CHAR_OFFSET = 64;



var tryLoad = function() {
    var g = document.getElementsByTagName('g')[0];
    if (!g) {
        setTimeout(tryLoad, 100);
    } else {
        height = g.getAttribute('height').split('').map(function (char) {
            return char.charCodeAt(0) - CHAR_OFFSET;
        });
        for (var hi = 0; hi < height.length; hi++)
            heightMax[hi] = height[hi] + 1;
    }
};
tryLoad();
//if(localStorage[cacheName+'#height']) {
//    height = localStorage[cacheName+'#height'].split('').map(function(n){ return n.charCodeAt(0) - CHAR_OFFSET; });
//    heightMax = localStorage[cacheName+'#heightMax'].split('').map(function(n){ return n.charCodeAt(0) - CHAR_OFFSET; });
//}

//var storeCount = 1;
function isCollisionPoint(x, y) {
    if(y <= height[x] && !isNaN(height[x]))
        return false;

    if(y >= heightMax[x])
        return true;

    if(x<0 || y<0 || x>svgDoc.offsetWidth || y>svgDoc.offsetHeight)
        return false;

    //height[x] = 0;
    //heightMax[x] = svgDoc.offsetHeight;

    var test = !!elementFromPoint(x, y);
    console.log("Test: ", x, y, test);
    if(test) {
        heightMax[x] = y;
    } else {
        height[x] = y;
    }

    return test;
}

function isTerrainElement(element) {
    return element.classList && element.classList.contains('terrain');
}

function onCollision(e) {
    if(!isTerrainElement(e.target))
        return;
    e.detail.isCollisionPoint = function(x, y) {
        //
        //if(isNaN(heights[x])) {
        //    for (var i = 0; i < 64; i++) {
        //        if (!isNaN(heights[x + i])) {
        //            scanTerrain(x, y, x + i, heights[x + i]);
        //            break;
        //        }
        //        if (!isNaN(heights[x - i])) {
        //            scanTerrain(x, y, x - i, heights[x - i]);
        //            break;
        //        }
        //    }
        //}
        return isCollisionPoint(x, y);
    };
}


var onStats = function (e) {
//         e.detail.stats.tank = {
//             data: 'data'
//         }
};


function onCompile() {
    for(var x=0; x<=svgDoc.offsetWidth; x++) {
        var min = 0;
        var max = svgDoc.offsetHeight;
        while(max > min + 1) {
            var y = parseInt((min + max) / 2);
            if(isCollisionPoint(x, y)) {
                max = y;
            } else {
                min = y;
            }
        }
    }

    localStorage[cacheName + '#height'] = height.map(function(h) { return String.fromCharCode(h + CHAR_OFFSET); }).join('');
    localStorage[cacheName + '#heightMax'] = heightMax.map(function(h) { return String.fromCharCode(h + CHAR_OFFSET); }).join('');

    console.log("Compile Complete:", [height, heightMax]);
}