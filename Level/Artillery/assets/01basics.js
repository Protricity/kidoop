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


var lastTime = new Date().getTime();
var lastPoint = null;
var lastAngle = 20;
var lastPower = 0.5;
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

                lastAngle = lastAngle - distY / 5  ;
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

//     console.log(document.elementFromPoint(e.layerX, e.layerY));
//    for(var i=0; i<tanks.length; i++) {
//        var aimTank = tanks[i];

        //aimTank.dispatchEvent(new CustomEvent('aim', {
        //    detail: {
        //        angle: lastAngle,
        //        power: lastPower
        //    }
        //}));

        //var bb = aimTank.getBoundingClientRect();
        //var dx = e.layerX - bb.left - bb.width/2;
        //var dy = e.layerY - bb.top - bb.height/2;
        //var d = Math.sqrt(dx*dx + dy*dy) - 100;
        //if(d<0) d=0;
        //var cannonAngle = (-50 + 360 + Math.atan2(dx, dy) * 120 / Math.PI) % 360;
        //if(cannonAngle<0 || cannonAngle>270) cannonAngle = 0;
        //if(cannonAngle>70) cannonAngle = 70;
        //
        //var cannonPower = (d<500?d:500)/500 + 0.2;
        //if(cannonPower > 1)
        //    cannonPower = 1;
        //

    //}
}

//document.addEventListener('click', onMouse, true);
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

