/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */

WIND = 0;
GRAVITY = 1;

var DEFAULT_POWER = 0.22;
var RENDER_INTERVAL = 20;
var RENDER_MAX = 1000;

var lastRender = new Date().getTime();
var lastPerformance = [0,0];
var doRender = function() {
    var renderEvent = createEvent('render');

    document.dispatchEvent(renderEvent);

    var duration = (new Date().getTime() - lastRender);
    lastRender += duration;
    var performance = 1 - (duration / RENDER_MAX);
    if(performance < 0) performance = 0;
    if(performance > 1) performance = 1;
    performance = Math.round(performance * 2 + 1);
    if(lastPerformance[0] !== performance && ((new Date().getTime() - lastPerformance[1]) > 10000)) {
        document.rootElement.classList[performance === 1 ? 'add' : 'remove']('performance1');
        document.rootElement.classList[performance === 2 ? 'add' : 'remove']('performance2');
        document.rootElement.classList[performance === 3 ? 'add' : 'remove']('performance3');
        console.log('performance: ', performance, duration);
        lastPerformance = [performance, new Date().getTime()];
    }
};
var renderInterval = setInterval(doRender, RENDER_INTERVAL);

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
var curTank = null;
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


    if(pageX !== 0 && pageY !== 0) {
        if(lastPoint) {
            distX = pageX - lastPoint[0];
            distY = pageY - lastPoint[1];
        }
        //dist = Math.sqrt(distX*distX + distY*distY);
        lastPoint = [pageX, pageY];
    }

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

                    fireTank.lastFlipped = fbb.left + fbb.width/2 > lastPoint[0];

                    fireTank.dispatchEvent(createEvent('fire', {
                        angle: fireTank.lastAngle || 0,
                        power: fireTank.lastPower || DEFAULT_POWER,
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
                    aimTank.lastPower = (aimTank.lastPower || DEFAULT_POWER) + powerDistX / 1000;
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


var isWindDragging = false;
var changeWindTimeout = null;
function addWind(amount) {
    WIND += amount;
    if(WIND > 10) WIND = 10;
    if(WIND < -10) WIND = -10;

    var uiWindValue = document.getElementById('ui-wind-value');
    uiWindValue.setAttribute('transform', 'translate(' + (WIND) + ', 0)');

    var uiCannonAngleTextValue = document.getElementById('ui-wind-text-value');
    uiCannonAngleTextValue.innerHTML = 'Wind: ' + WIND + 'px/s';


    var windTanks = document.getElementsByClassName('usertank');
    for(var ai=0; ai<windTanks.length; ai++) {
        var aimTank = windTanks[ai];
        aimTank.dispatchEvent(createEvent('aim', {
            angle: aimTank.lastAngle || 0,
            power: aimTank.lastPower || DEFAULT_POWER,
            flipped: aimTank.lastFlipped
            //                     flipped: abb.left + abb.width/2 > e.pageX
        }));
    }

    var changeWind = function() {
        var windAnimations = document.getElementsByClassName('wind-animation');
        for (var wi = 0; wi < windAnimations.length; wi++) {
            var dur = (wi + 1) * 1000;
            if (WIND == 0) {
                windAnimations[wi].setAttribute('from', dur + ' 0');
                windAnimations[wi].setAttribute('to', -dur + ' 0');
                windAnimations[wi].setAttribute('dur', '100 s');

            } else if (WIND > 0) {
                windAnimations[wi].setAttribute('from', -dur + ' 0');
                windAnimations[wi].setAttribute('to', dur + ' 0');
                windAnimations[wi].setAttribute('dur', 20 * (11 - WIND) + 's');

            } else if (WIND < 0) {
                windAnimations[wi].setAttribute('from', dur + ' 0');
                windAnimations[wi].setAttribute('to', -dur + ' 0');
                windAnimations[wi].setAttribute('dur', 20 * (11 + WIND) + 's');

            }
        }
    };
    if(changeWindTimeout) clearTimeout(changeWindTimeout);
    changeWindTimeout = setTimeout(changeWind, 300);
}
setTimeout(function() {addWind(0)}, 100);

function setWind(e) {
    var pageX = e.pageX;
    var pageY = e.pageY;
    if(e.touches && e.touches.length) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
    }

    switch(e.type) {
        case 'touchstart':
        case 'mousedown':
            isWindDragging = pageX;
            break;
        case 'mousemove':
        case 'touchmove':
            if(typeof isWindDragging === 'number') {
                var distX = isWindDragging - pageX;
                isWindDragging = pageX;

                if(distX) {
                    addWind(distX < 0 ? 1 : -1);
                }
            }
            break;
        default:
        case 'touchend':
        case 'mouseout':
        case 'mouseup':
            isWindDragging = false;
            break;
    }
    e.preventDefault();
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


function addGravity(amount) {
    GRAVITY -= amount;
    if(GRAVITY > 16) GRAVITY = 16;
    if(GRAVITY < -16) GRAVITY = -16;

    var uiGravityValue = document.getElementById('ui-gravity-value');
    uiGravityValue.setAttribute('transform', 'translate(' + (-GRAVITY) + ', 0)');

    var uiGravityTextValue = document.getElementById('ui-gravity-text-value');
    uiGravityTextValue.innerHTML = GRAVITY + 'px/s';


    var gravityTanks = document.getElementsByClassName('usertank');
    for(var ai=0; ai<gravityTanks.length; ai++) {
        var gravityTank = gravityTanks[ai];
        gravityTank.dispatchEvent(createEvent('aim', {
            angle: gravityTank.lastAngle || 0,
            power: gravityTank.lastPower || 1,
            flipped: gravityTank.lastFlipped
            //                     flipped: abb.left + abb.width/2 > pageX
        }));
    }

    
}
setTimeout(function() {addGravity(0)}, 100);


var isGravityDragging = false;
function setGravity(e) {
    var pageX = e.pageX;
    var pageY = e.pageY;
    if(e.touches && e.touches.length) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
    }

    switch(e.type) {
        case 'touchstart':
        case 'mousedown':
            isGravityDragging = pageY;
            break;
        case 'touchmove':
        case 'mousemove':
            if(typeof isGravityDragging === 'number') {
                var distY = pageY - isGravityDragging;
                isGravityDragging = pageY;

                if(distY) {
                    addGravity(distY < 0 ? 1 : -1);
                }
            }
            break;
        default:
        case 'touchend':
        case 'mouseout':
        case 'mouseup':
            isGravityDragging = false;
            break;
    }
    e.preventDefault();
}



//document.addEventListener('click', onMouse, true);
document.addEventListener('mousemove', onMouse, false);
document.addEventListener('mouseup', onMouse, false);
document.addEventListener('mousedown', onMouse, false);
//document.addEventListener('mouseout', onMouse, false);

document.addEventListener('touchstart', onMouse, false);
document.addEventListener('touchmove', onMouse, false);
document.addEventListener('touchend', onMouse, false);

