/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */

WIND = -4;
GRAVITY = 3;

var doRender = function() {
    var renderEvent = createEvent('render');
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


var setWind = function (elm, e) {
    console.log(elm, e);
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
        tanks = selectedTanks = [userTanks[0]];
        if(userTanks.length>1) {
            for (var si = 0; si < userTanks.length; si++) {
                var bb = userTanks[si].getBoundingClientRect();
                var curTankDist = Math.sqrt(Math.pow(e.pageX - (bb.left + bb.width / 2), 2) + Math.pow(e.pageY - (bb.top + bb.height / 2), 2));
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
                    var fbb = fireTank.getBoundingClientRect();

                    fireTank.lastFlipped = fbb.left + fbb.width/2 > e.pageX;

                    fireTank.dispatchEvent(createEvent('fire', {
                        angle: fireTank.lastAngle || 0,
                        power: fireTank.lastPower || 0.5,
                        flipped: fireTank.lastFlipped || false // fbb.left + fbb.width/2 > e.pageX
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

                    aimTank.lastPower = (aimTank.lastPower || 0.55) + distX / 1000;
                    if(aimTank.lastPower > 1)
                        aimTank.lastPower = 1;
                    if(aimTank.lastPower < 0.2)
                        aimTank.lastPower = 0.2;

                    aimTank.lastFlipped = abb.left + abb.width/2 > e.pageX;

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

function selectTank(tankElement) {
    tankElement.classList.contains('selected')
        ? tankElement.classList.remove('selected')
        : tankElement.classList.add('selected');
}

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
    evt.detail = data || {}
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


// classList polyfill
"document"in self&&("classList"in document.createElement("_")?!function(){"use strict";var t=document.createElement("_");if(t.classList.add("c1","c2"),!t.classList.contains("c2")){var e=function(t){var e=DOMTokenList.prototype[t];DOMTokenList.prototype[t]=function(t){var n,i=arguments.length;for(n=0;i>n;n++)t=arguments[n],e.call(this,t)}};e("add"),e("remove")}if(t.classList.toggle("c3",!1),t.classList.contains("c3")){var n=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return 1 in arguments&&!this.contains(t)==!e?e:n.call(this,t)}}t=null}():!function(t){"use strict";if("Element"in t){var e="classList",n="prototype",i=t.Element[n],s=Object,r=String[n].trim||function(){return this.replace(/^\s+|\s+$/g,"")},o=Array[n].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1},a=function(t,e){this.name=t,this.code=DOMException[t],this.message=e},c=function(t,e){if(""===e)throw new a("SYNTAX_ERR","An invalid or illegal string was specified");if(/\s/.test(e))throw new a("INVALID_CHARACTER_ERR","String contains an invalid character");return o.call(t,e)},l=function(t){for(var e=r.call(t.getAttribute("class")||""),n=e?e.split(/\s+/):[],i=0,s=n.length;s>i;i++)this.push(n[i]);this._updateClassName=function(){t.setAttribute("class",this.toString())}},u=l[n]=[],f=function(){return new l(this)};if(a[n]=Error[n],u.item=function(t){return this[t]||null},u.contains=function(t){return t+="",-1!==c(this,t)},u.add=function(){var t,e=arguments,n=0,i=e.length,s=!1;do t=e[n]+"",-1===c(this,t)&&(this.push(t),s=!0);while(++n<i);s&&this._updateClassName()},u.remove=function(){var t,e,n=arguments,i=0,s=n.length,r=!1;do for(t=n[i]+"",e=c(this,t);-1!==e;)this.splice(e,1),r=!0,e=c(this,t);while(++i<s);r&&this._updateClassName()},u.toggle=function(t,e){t+="";var n=this.contains(t),i=n?e!==!0&&"remove":e!==!1&&"add";return i&&this[i](t),e===!0||e===!1?e:!n},u.toString=function(){return this.join(" ")},s.defineProperty){var h={get:f,enumerable:!0,configurable:!0};try{s.defineProperty(i,e,h)}catch(g){-2146823252===g.number&&(h.enumerable=!1,s.defineProperty(i,e,h))}}else s[n].__defineGetter__&&i.__defineGetter__(e,f)}}(self));
