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

document.addEventListener('click', function(e) {
    var tanks = document.getElementsByClassName('usertank');
//     console.log(document.elementFromPoint(e.layerX, e.layerY));
    for(var i=0; i<tanks.length; i++)
        tanks[i].dispatchEvent(new CustomEvent('fire', {
            detail: {
                clickEvent: e
            }
        }));
}, true);

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

