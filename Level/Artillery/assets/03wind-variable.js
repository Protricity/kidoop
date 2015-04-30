/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */

WIND = -4;
GRAVITY = 3;

var doRender = function() {
    var renderEvent = new CustomEvent('render');
    document.dispatchEvent(renderEvent);
};
var renderInterval = setInterval(doRender, 30);

var pause = function() {
    clearInterval(renderInterval);
};
var resume = function() {
    clearInterval(renderInterval);
    renderInterval = setInterval(doRender, 30)
};


var setWind = function (elm) {
    console.log(elm);
};

var lastTime = new Date().getTime();
var lastPoint = null;
var isDragging = false;
var curTank = null;
// var lastPower = 1;

var selectedTanks = document.getElementsByClassName('usertank selected');
var userTanks = document.getElementsByClassName('usertank');
function onMouse(e) {
    var dist = 0;
    var distX = 0;
    var distY = 0;
    if(lastPoint) {
        distX = e.pageX - lastPoint[0];
        distY = e.pageY - lastPoint[1];
        dist = Math.sqrt(distX*distX + distY*distY);
    }
    lastPoint = [e.pageX, e.pageY];

    var tanks = selectedTanks;
    if(tanks.length === 0 && e.type === 'mousedown') {
        var tankDist = 9999;
        tanks = [userTanks[0]];
        for(var si=0; si<userTanks.length; si++) {
            var bb = userTanks[si].getBoundingClientRect();
            var curTankDist = Math.sqrt(Math.pow(e.pageX - (bb.left + bb.width/2), 2) + Math.pow(e.pageY - (bb.top + bb.height/2), 2));
            if(curTankDist < tankDist) {
                tankDist = curTankDist;
                //noinspection JSValidateTypes
                tanks = selectedTanks = [userTanks[si]];
                console.log('selected: ', selectedTanks);
            }
        }
    }


    var endTime = new Date().getTime();
    var longpress = (endTime - lastTime >= 500);

    switch(e.type) {
        case 'click':
            isDragging = false;
            break;

        case 'mousedown':
            isDragging = true;
            lastTime = new Date().getTime();
            return;

        case 'mouseup':
        case 'mousemove':
            if(e.type === 'mouseup' && !longpress) {
                for(var fi=0; fi<tanks.length; fi++) {
                    var fireTank = tanks[fi];
                    fireTank.dispatchEvent(new CustomEvent('fire', {
                        detail: {
                            angle: fireTank.lastAngle || 0,
                            power: fireTank.lastPower || 0.5
                        }
                    }));
                }
                isDragging = false;
                selectedTanks = document.getElementsByClassName('usertank selected');
                lastTime = new Date().getTime();
                return;
            }

            if(isDragging) {


                for(var ai=0; ai<tanks.length; ai++) {
                    var aimTank = tanks[ai];

                    aimTank.lastAngle = (aimTank.lastAngle || 0) - distY / 8;
                    if(aimTank.lastAngle > 70)
                        aimTank.lastAngle = 70;
                    else if(aimTank.lastAngle < 0 || aimTank.lastAngle > 270)
                        aimTank.lastAngle = 0;

                    aimTank.lastPower = (aimTank.lastPower || 0.55) + distX / 1000;
                    if(aimTank.lastPower > 1)
                        aimTank.lastPower = 1;
                    if(aimTank.lastPower < 0.2)
                        aimTank.lastPower = 0.2;

                    aimTank.dispatchEvent(new CustomEvent('aim', {
                        detail: {
                            angle: aimTank.lastAngle,
                            power: aimTank.lastPower
                        }
                    }));
                }

                if(e.type === 'mouseup') {
                    isDragging = false;
                    selectedTanks = document.getElementsByClassName('usertank selected');
                }
            }
            break;

        default:
            throw new Error("Invalid Event: ", e);
    }

}

function selectTank(tankElement) {
    tankElement.classList.contains('selected')
        ? tankElement.classList.remove('selected')
        : tankElement.classList.add('selected');
}

//document.addEventListener('click', onMouse, true);
document.addEventListener('mousemove', onMouse, true);
document.addEventListener('mouseup', onMouse, true);
document.addEventListener('mousedown', onMouse, true);

document.addEventListener('touchstart', onMouse, true);
document.addEventListener('touchmove', onMouse, true);
document.addEventListener('touchend', onMouse, true);

//document.addEventListener('xy', function(e) {
//    var container = document.getElementsByClassName('artillery001')[0];
//    container.dataset.ax = e.detail.percX * 20 - 10;
//    container.dataset.ay = e.detail.percY * 20 - 10;
//    e.detail.formatX = Math.round(container.dataset.ax*10)/10 + 'px/s';
//    e.detail.formatY = Math.round(container.dataset.ay*10)/10 + 'px/s';
//    e.detail.tankCount = document.getElementsByClassName('tank').length - 1;
//});

//document.addEventListener('touchmove', function(e) {
//    e.preventDefault();
//});

