var renderList = document.getElementsByClassName('projectile');

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
    for(var i=0; i<tanks.length; i++)
        tanks[i].dispatchEvent(new CustomEvent('fire'));
}, true);

document.addEventListener('xy', function(e) {
    var container = document.getElementsByClassName('artillery001')[0];
    container.dataset.ax = e.detail.percX * 20 - 10;
    container.dataset.ay = e.detail.percY * 20 - 10;
});