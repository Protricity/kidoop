/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var WALL_BOUNCE_COOEFICIENT = 0.40;

var svgDoc = document.getElementsByTagName('svg')[0];

var heightCache = [];
function isCollisionPoint(x, y) {
    if(heightCache[x]) {
        if (y <= heightCache[x][0])
            return false;
        if (y >= heightCache[x][1])
            return true;
    } else {
        heightCache[x] = [0, svgDoc.offsetHeight || svgDoc.height.baseVal.value];
    }

    var test = !!document.elementFromPoint(x, y);
    if(test) {
        heightCache[x][1] = y;
    } else {
        heightCache[x][0] = y;
    }

    console.log("Test: ", [x, y, test]);
    return test;
}

var onCollision = function(e) {
    e.detail.isCollisionPoint = isCollisionPoint;
};


var onStats = function (e) {
//         e.detail.stats.tank = {
//             data: 'data'
//         }
};


document.addEventListener('collision', onCollision, true);
document.addEventListener('stats', onStats, true);

