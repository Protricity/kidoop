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
var isDragging = false;
// var lastPower = 1;
var selectedTanks = document.getElementsByClassName('usertank selected');
var userTanks = document.getElementsByClassName('usertank');
function onMouse(e) {
    if(e.defaultPrevented)
        return;

    e.preventDefault();
    //var dist = 0;
    var distX = 0;
    var distY = 0;

    var pageX = e.pageX;
    var pageY = e.pageY;
    if(!pageX && e.touches && e.touches.length) {
//         if(e.touches.length === 0)
//             return;
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
    }


    if(lastPoint) {
        distX = pageX - lastPoint[0];
        distY = pageY - lastPoint[1];
        //dist = Math.sqrt(distX*distX + distY*distY);
    }
    lastPoint = [pageX, pageY];

    var tanks = selectedTanks;
    if(tanks.length === 0 && (e.type === 'touchstart' || e.type === 'mousedown')) {
        var tankDist = 9999;
        tanks = selectedTanks = [userTanks[0]];
        if(userTanks.length>1) {
            for (var si = 0; si < userTanks.length; si++) {
                var bb = userTanks[si].getBoundingClientRect();
                var curTankDist = Math.sqrt(Math.pow(pageX - (bb.left + bb.width / 2), 2) + Math.pow(pageY - (bb.top + bb.height / 2), 2));
                if (curTankDist < tankDist) {
                    tankDist = curTankDist;
                    //noinspection JSValidateTypes
                    tanks = selectedTanks = [userTanks[si]];
                }
            }
        }
    }


    var endTime = new Date().getTime();
    var longpress = (endTime - lastTime >= 500);

    switch(e.type) {
        case 'touchstart':
        case 'mousedown':
            isDragging = true;
            lastTime = new Date().getTime();
            return;

        case 'touchmove':
        case 'touchend':
        case 'mouseup':
        case 'mousemove':
            if((e.type === 'mouseup' || e.type === 'touchend') && !longpress) {
                for(var fi=0; fi<tanks.length; fi++) {
                    var fireTank = tanks[fi];
                    var fbb = fireTank.getBoundingClientRect();

                    if(pageX !== 0 && pageY !== 0)
                        fireTank.lastFlipped = fbb.left + fbb.width/2 > pageX;

                    fireTank.dispatchEvent(createEvent('fire', {
                        angle: fireTank.lastAngle || 0,
                        power: fireTank.lastPower || 0.5,
                        flipped: fireTank.lastFlipped || false // fbb.left + fbb.width/2 > pageX
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
                    var abb = aimTank.getBoundingClientRect();

                    aimTank.lastAngle = (aimTank.lastAngle || 0) - distY / 8;
                    if(aimTank.lastAngle > 70)
                        aimTank.lastAngle = 70;
                    else if(aimTank.lastAngle < 0 || aimTank.lastAngle > 270)
                        aimTank.lastAngle = 0;

                    var powerDistX = distX;
                    if(pageX < abb.left + abb.width/2)
                        powerDistX = -powerDistX;
                    aimTank.lastPower = (aimTank.lastPower || 0.95) + powerDistX / 1000;
                    if(aimTank.lastPower > 1)
                        aimTank.lastPower = 1;
                    if(aimTank.lastPower < 0.2)
                        aimTank.lastPower = 0.2;

                    //aimTank.lastFlipped = abb.left + abb.width/2 > pageX;

                    aimTank.dispatchEvent(createEvent('aim', {
                        angle: aimTank.lastAngle,
                        power: aimTank.lastPower,
                        flipped: aimTank.lastFlipped

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


var isPowerDragging = false;
function setPower(e, tankID) {
    var pageX = e.pageX;
    var pageY = e.pageY;
    if(e.touches && e.touches.length) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
    }

    switch(e.type) {
        case 'touchstart':
        case 'mousedown':
            isPowerDragging = pageY;
            break;
        case 'touchmove':
        case 'mousemove':
            if(typeof isPowerDragging === 'number') {
                var distY = isPowerDragging - pageY;
                isPowerDragging = pageY;

                var powerTank = document.getElementById(tankID);
                powerTank.lastPower = (powerTank.lastPower || 0.90) + distY / 200;
                if(powerTank.lastPower > 1)
                    powerTank.lastPower = 1;
                if(powerTank.lastPower < 0.2)
                    powerTank.lastPower = 0.2;

                powerTank.dispatchEvent(createEvent('aim', {
                    angle: powerTank.lastAngle || 0,
                    power: powerTank.lastPower,
                    flipped: powerTank.lastFlipped
//                     flipped: abb.left + abb.width/2 > pageX
                }));
            }
            break;
        default:
        case 'touchend':
        case 'mouseout':
        case 'mouseup':
            isPowerDragging = false;
            break;
    }
    e.preventDefault();
}


var isAngleDragging = false;
function setAngle(e, tankID) {
    var pageX = e.pageX;
    var pageY = e.pageY;
    if(e.touches && e.touches.length) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
    }

    switch(e.type) {
        case 'mousedown':
        case 'touchstart':
            isAngleDragging = pageY;
            break;
        case 'touchmove':
        case 'mousemove':
            if(typeof isAngleDragging === 'number') {
                var distY = isAngleDragging - pageY;
                isAngleDragging = pageY;

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
//                     flipped: abb.left + abb.width/2 > pageX
                }));
            }
            break;
        default:
        case 'touchend':
        case 'mouseout':
        case 'mouseup':
            isAngleDragging = false;
            break;
    }
    e.preventDefault();
}


//document.addEventListener('click', onMouse, true);
document.addEventListener('mousemove', onMouse, false);
document.addEventListener('mouseup', onMouse, false);
document.addEventListener('mousedown', onMouse, false);

document.addEventListener('touchstart', onMouse, false);
document.addEventListener('touchmove', onMouse, false);
document.addEventListener('touchend', onMouse, false);



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

