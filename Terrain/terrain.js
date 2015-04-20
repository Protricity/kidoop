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
    if(elm === null || elm === svgDoc)
        return null;
    if(elm.classList && elm.classList.contains('nohit'))
        return null;
    return elm;
}

var height = [];
var heightMax = [];
var cacheName = document.location.href;

var CHAR_OFFSET = 64;


var tryLoad = function() {
    var g = document.getElementsByTagName('g')[0];
    if (!g) {
        setTimeout(tryLoad, 100);
    } else if(g.getAttribute('height')) {
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
    var w = document.documentElement.offsetWidth || document.documentElement.width.baseVal.value;
    var h = document.documentElement.offsetHeight || document.documentElement.height.baseVal.value;

    if(Math.abs(x) > w/2 || Math.abs(y) > h/2)
        return false;

    x += w/2;
    y += h/2;

    if(y <= height[x] && !isNaN(height[x]))
        return false;

    if(y >= heightMax[x])
        return true;

    var test = !!elementFromPoint(x, y);
    //console.log("Test Terrain: ", x, y, test);
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
    e.detail.testPoint = function(x, y) {

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