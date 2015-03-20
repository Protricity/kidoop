/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    var CLASS_DROP_CONTAINER = 'drop-container';

    //var body;
    var dropAt = function(elm, dropElm, x, y, fromX, fromY) {
        dropElm.dataset.x = x || 0;
        dropElm.dataset.y = y || 0;
        dropElm.style.left = Math.round(x) + 'px';
        dropElm.style.top = Math.round(y) + 'px';
        if(!dropElm.style.position)
            dropElm.style.position = 'absolute';
        elm.appendChild(dropElm);
        console.log("Dropped ", x, y, [dropElm]);

        if(typeof fromX !== 'undefined') {
            dropElm.dataset.vx = (x - fromX) / 80;
            dropElm.dataset.vy = (y - fromY) / 80;
        }
    };

    var lastDragObject, lastClickOffset, lastDragStart, lastDragOver;
    var onDrag = function(e) {
        var isDraggable = !!e.target.getAttribute('draggable');
        var isDroppable = e.target.classList.contains(CLASS_DROP_CONTAINER);
        console.log("Drag ", [e.target, isDraggable]);

        switch(e.type) {
            case 'dragging':
            case 'click':
            case 'drop':
                var draggings = document.getElementsByClassName('dragging');
                if(isDraggable) {
                    var isDragging = e.target.classList.contains('dragging');
                    lastClickOffset = [e.offsetX, e.offsetY];
                    lastDragStart = [e.target.offsetLeft, e.target.offsetTop];


                    if(e.shiftKey === true) {

                    } else if (e.ctrlKey === true) {
                        var siblings = e.target.parentNode.getElementsByTagName(e.target.nodeName);
                        for(var dci=0; dci<siblings.length; dci++) 
                            if(siblings[dci].getAttribute('draggable'))
                                isDragging
                                    ? siblings[dci].classList.remove('dragging')
                                    : siblings[dci].classList.add('dragging');
                    } else {
                        for(var dcj=0; dcj<draggings.length; dcj++)
                            draggings[dcj].classList.remove('dragging');
                    }
                    isDragging
                        ? e.target.classList.remove('dragging')
                        : e.target.classList.add('dragging');

                } else if (isDroppable) {
                    e.target.classList.remove('dragleave');
                    e.target.classList.remove('dragenter');
                    e.target.classList.add('drop');

                    // Iterate backwards 
                    for(var dck=draggings.length-1; dck>=0; dck--) {
                        var dragging = draggings.item(dck);
                        dropAt(e.target, dragging,
                            e.offsetX - lastClickOffset[0],
                            e.offsetY - lastClickOffset[1],
                            lastDragStart[0] - lastClickOffset[0],
                            lastDragStart[1] - lastClickOffset[1]);
                        dragging.classList.remove('dragging');
                    }
                }
                break;

            case 'dragstart':
//                 lastDragObject = e.target;
                lastClickOffset = [e.offsetX, e.offsetY];
                lastDragStart = [e.target.offsetLeft, e.target.offsetTop];
                e.target.classList.add('dragging');
                break;

            case 'dragover':
                e.stopPropagation();
                //e.dataTransfer.dropEffect = 'move';
                if(isDroppable) {
                    lastDragOver = [e.target.offsetLeft, e.target.offsetTop];
                    e.preventDefault();
                }
                break;

            case 'dragenter':
                e.target.classList.remove('drop');
                e.target.classList.remove('dragleave');
                e.target.classList.add('dragenter');
                break;

            case 'dragleave':
                e.target.classList.remove('dragenter');
                //e.target.classList.add('dragleave');
                break;

//             case 'drop':
//                 break;

            default:
                console.error("Unknown event: " + e.type);
        }
    };

    if(typeof document.draggable !== 'undefined')
        return;

    document.draggable = true;
    document.addEventListener('dragstart', onDrag, false);
    document.addEventListener('dragover', onDrag, false);
    document.addEventListener('dragenter', onDrag, false);
    document.addEventListener('dragleave', onDrag, false);
    document.addEventListener('drop', onDrag, false);
    document.addEventListener('click', onDrag, false);

//     document.addEventListener('DOMContentLoaded', onReady);
//     document.addEventListener('ready', onReady);
})();