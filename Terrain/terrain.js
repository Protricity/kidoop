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
}
CONFIG.documents.push(document);

var svgDoc = document.getElementsByTagName('svg')[0];
function elementFromPoint(x, y) {
    var elm = document.elementFromPoint(x, y);
    if(elm === svgDoc) 
        return null;
    return elm;
}

var heightCache = [];
function isCollisionPoint(x, y) {
    if(heightCache[x]) {
        if (y <= heightCache[x][0])
            return false;
        if (y >= heightCache[x][1])
            return true;
    } else {
        if(x<0 || y<0 || x>svgDoc.offsetWidth || y>svgDoc.offsetHeight)
            return false;
        heightCache[x] = [0, svgDoc.offsetHeight || 999999];
    }

    var test = !!elementFromPoint(x, y);
    if(test) {
        heightCache[x][1] = y;
    } else {
        heightCache[x][0] = y;
    }

    //isCollisionPoint(x, Math.floor(heightCache[x][0] / 2 + heightCache[x][1] / 2));
    console.log("Test: ", x, y, test);
    return test;
}

function isTerrainElement(element) {
    return element.classList && element.classList.contains('terrain');
}

function onCollision(e) {
    if(!isTerrainElement(e.target))
        return;
    e.detail.isCollisionPoint = function(x, y) {
        return isCollisionPoint(x, y);
    };
}


var onStats = function (e) {
//         e.detail.stats.tank = {
//             data: 'data'
//         }
};


