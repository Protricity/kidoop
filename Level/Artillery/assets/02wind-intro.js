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


var lastTime = new Date().getTime();
var lastPoint = null;
var lastAngle = 0;
var lastPower = 0.55;
var isDragging = false;
// var lastPower = 1;
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

    var tanks = document.getElementsByClassName('usertank');

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
                            angle: lastAngle,
                            power: lastPower
                        }
                    }));
                }
                isDragging = false;
                lastTime = new Date().getTime();
                return;
            }

            if(isDragging) {

                lastAngle = lastAngle - distY / 8;
                if(lastAngle > 70)
                    lastAngle = 70;
                else if(lastAngle < 0 || lastAngle > 270)
                    lastAngle = 0;

                lastPower = lastPower + distX / 1000;
                if(lastPower > 1)
                    lastPower = 1;
                if(lastPower < 0.2)
                    lastPower = 0.2;

                for(var ai=0; ai<tanks.length; ai++) {
                    var aimTank = tanks[ai];
                    aimTank.dispatchEvent(new CustomEvent('aim', {
                        detail: {
                            angle: lastAngle,
                            power: lastPower
                        }
                    }));
                }

                if(e.type === 'mouseup') {
                    isDragging = null;
                }
            }
            break;

        default:
            throw new Error("Invalid Event: ", e);
    }

}

//document.addEventListener('click', onMouse, true);
document.addEventListener('mousemove', onMouse, true);
document.addEventListener('mouseup', onMouse, true);
document.addEventListener('mousedown', onMouse, true);

document.addEventListener('touchstart', onMouse, true);
document.addEventListener('touchmove', onMouse, true);
document.addEventListener('touchend', onMouse, true);


var isPowerDragging = false;
function setPower(e, tankID) {
    switch(e.type) {
        case 'mousedown':
            isPowerDragging = e.pageY;
            break;
        case 'mousemove':
            if(typeof isPowerDragging === 'number') {
                var distY = isPowerDragging - e.pageY;
                isPowerDragging = e.pageY;

                var powerTank = document.getElementById(tankID);
                powerTank.lastPower = (powerTank.lastPower || 0.55) + distY / 100;
                if(powerTank.lastPower > 1)
                    powerTank.lastPower = 1;
                if(powerTank.lastPower < 0.2)
                    powerTank.lastPower = 0.2;

                powerTank.dispatchEvent(createEvent('aim', {
                    angle: powerTank.lastAngle || 0,
                    power: powerTank.lastPower,
                    flipped: powerTank.lastFlipped
//                     flipped: abb.left + abb.width/2 > e.pageX
                }));
            }
            break;
        default:
        case 'mouseout':
        case 'mouseup':
            isPowerDragging = false;
            break;
    }
    e.preventDefault();
}


var isAngleDragging = false;
function setAngle(e, tankID) {
    switch(e.type) {
        case 'mousedown':
            isAngleDragging = e.pageY;
            break;
        case 'mousemove':
            if(typeof isAngleDragging === 'number') {
                var distY = isAngleDragging - e.pageY;
                isAngleDragging = e.pageY;

                var aimTank = document.getElementById(tankID);
                aimTank.lastAngle = (aimTank.lastAngle || 0) + distY / 2;
                if(aimTank.lastAngle > 70)
                    aimTank.lastAngle = 70;
                else if(aimTank.lastAngle < 0 || aimTank.lastAngle > 270)
                    aimTank.lastAngle = 0;

                aimTank.dispatchEvent(createEvent('aim', {
                    angle: aimTank.lastAngle || 0,
                    power: aimTank.lastPower,
                    flipped: aimTank.lastFlipped
//                     flipped: abb.left + abb.width/2 > e.pageX
                }));
            }
            break;
        default:
        case 'mouseout':
        case 'mouseup':
            isAngleDragging = false;
            break;
    }
    e.preventDefault();
}


function createEvent(name, data) {
    if(typeof CustomEvent !== 'undefined')
        return new CustomEvent(name, {detail:data});
    var evt = document.createEvent('Event');
    evt.initEvent(name, true, true, data);
    evt.detail = data || {};
    return evt;
}


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

