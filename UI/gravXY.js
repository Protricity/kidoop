
var dragging = false;
function onClick(e) {
    var w = document.documentElement.offsetWidth;
    var h = document.documentElement.offsetHeight;
    var x = e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    var y = e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop;

    x-=50;
    y-=50;
    w-=100;
    h-=100;

    if(x<0) x=0;
    if(y<0) y=0;
    if(x>w) x=w;
    if(y>h) y=h;


    switch(e.type) {
        default:
        case 'click':
            dragging = false;
            break;
        case 'mousedown':
            dragging = true;
            break;
        case 'mouseup':
            dragging = false;
            break;
        case 'mousemove':
            if(!dragging)
                return;
            break;
    }

    var g = document.getElementById('controls');
    g.setAttribute('transform', 'translate(' + (x) + ', ' + (y-80) + ')');

    var event = new CustomEvent('xy', {
        detail: {
            x: x,
            y: y,
            totalX: w,
            totalY: h,
            percX: x / w,
            percY: y / h,
            formatX: null,
            formatY: null,
            tankCount: null
        }
    });

    document.dispatchEvent(event);
    window.top.document.dispatchEvent(event);

    if(event.detail.formatX !== null)
        document.getElementById('text-ax-value').innerHTML = event.detail.formatX;
    if(event.detail.formatY !== null)
        document.getElementById('text-ay-value').innerHTML = event.detail.formatY;
    if(event.detail.tankCount !== null)
        document.getElementById('text-tank-count').innerHTML = event.detail.tankCount;
}
document.addEventListener('click', onClick);

document.addEventListener('mousedown', onClick);
document.addEventListener('mousemove', onClick);
document.addEventListener('mouseup', onClick);
