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