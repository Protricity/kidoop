/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
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

var mouseDown = false;
var lastAngle = 0;
// var lastPower = 1;
function onMouse(e) {

    var eventName = null;
    switch(e.type) {
        case 'click':
            eventName = 'fire';
            mouseDown = false;
            break;

        case 'mousedown':
            mouseDown = true;
            return;

        case 'mouseup':
        case 'mousemove':
            eventName = 'aim';
            break;

        default:
            throw new Error("Invalid Event: ", e);
    }

    var tanks = document.getElementsByClassName('usertank');
//     console.log(document.elementFromPoint(e.layerX, e.layerY));
    for(var i=0; i<tanks.length; i++) {
        var tank = tanks[i];
        var bb = tank.getBoundingClientRect();
        var dx = e.layerX - bb.left - bb.width/2;
        var dy = e.layerY - bb.top - bb.height/2;
        var d = Math.sqrt(dx*dx + dy*dy) - 100;
        if(d<0) d=0;
        var cannonAngle = (-50 + 360 + Math.atan2(dx, dy) * 120 / Math.PI) % 360;
        if(cannonAngle<0 || cannonAngle>270) cannonAngle = 0;
        if(cannonAngle>70) cannonAngle = 70;

        var cannonPower = (d<500?d:500)/500 + 0.2;
        if(cannonPower > 1)
            cannonPower = 1;

        if(lastAngle > cannonAngle)
            lastAngle -= 0.5;
        else if(lastAngle < cannonAngle) 
            lastAngle += 0.5;

//         if(lastPower > cannonPower)
//             lastPower -= 0.01;
//         else if(lastPower < cannonPower)
//             lastPower += 0.01;

        tank.dispatchEvent(new CustomEvent(eventName, {
            detail: {
                angle: lastAngle,
                power: cannonPower
            }
        }));
    }
}

document.addEventListener('click', onMouse, true);
document.addEventListener('mousemove', onMouse, true);
document.addEventListener('mouseup', onMouse, true);
document.addEventListener('mousedown', onMouse, true);

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

