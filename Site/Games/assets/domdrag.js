/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

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
            dropElm.dataset.vx = (x - fromX) / 10;
            dropElm.dataset.vy = (y - fromY) / 10;
        }
    };

    var lastDragObject = null;
    var initObject = function(element) {
        if(typeof element.dropAt !== 'undefined')
            return;
        element.dropAt = function(container, x, y) { return dropAt(null, container, this, x, y); };

        var onDrag = function(e) {
            var isPhysBox = false;
            if(this.classList.contains('physbox')) {
                isPhysBox = true;
            } else if (this.classList.contains('draggable') || this.getAttribute('draggable')) {


            } else {
                return false;

            }

            element.dataset.drag = e.type;
            switch(e.type) {
                case 'dragclick':
                case 'click':
                    var dragstarts = document.getElementsByClassName('dragclick');
                    if(e.shiftKey !== true)
                        for(var dci=0; dci<dragstarts.length; dci++)
                            dragstarts[dci].classList.remove'dragclick');
                    e.target.classList.add('dragclick');
                    break;
                case 'dragstart':
                    lastDragObject = e.target;
                    e.target.lastClickOffset = [e.offsetX, e.offsetY];
                    e.target.lastDragStart = [e.target.offsetLeft, e.target.offsetTop];
//                     console.log(e.type, [e.target], e.target.lastDragLocation);
                    break;
                case 'dragover':
                    e.stopPropagation();
                    e.target.lastDragOver = [e.target.offsetLeft, e.target.offsetTop];
                    //e.dataTransfer.dropEffect = 'move';
                    if(isPhysBox) {
                        e.preventDefault();
                    }
                    break;
                case 'dragenter': 
                    e.target.classList.remove('dragleave');
                    e.target.classList.add('dragenter');
                break;
                case 'dragleave':
                    e.target.classList.remove('dragenter');
                    //e.target.classList.add('dragleave');
                break;
                case 'drop':
                    e.target.classList.remove('dragleave');
                    e.target.classList.remove('dragenter');
                    e.target.classList.add('drop');
                    if(lastDragObject) {
                        dropAt(e.target, lastDragObject, 
                            e.offsetX - lastDragObject.lastClickOffset[0], 
                            e.offsetY - lastDragObject.lastClickOffset[1],
                            lastDragObject.lastDragStart[0] - lastDragObject.lastClickOffset[0],
                            lastDragObject.lastDragStart[1] - lastDragObject.lastClickOffset[1]);
                        lastDragObject = null;
                   }
                    break;
                case 'dragend': 
                    break;
                default: break;
            }
        };
        element.addEventListener('dragstart', onDrag, false);
        element.addEventListener('dragover', onDrag, false);
        element.addEventListener('dragenter', onDrag, false);
        element.addEventListener('dragleave', onDrag, false);
        element.addEventListener('drop', onDrag, false);
        element.addEventListener('dragend', onDrag, false);
        element.addEventListener('dragend', onDrag, false);
    };

    var doReady = function() {
        var physboxes = document.getElementsByClassName('physbox');
        for(var pi=0; pi<physboxes.length; pi++) {
            var physbox = physboxes[pi];
            initObject(physbox);

            var objects = physbox.children;
            for(var i=0; i<objects.length; i++) {
                var object = objects[i];
                initObject(object);
            }
        }
    };

    jQuery(document).ready(function() {
        jQuery('body')
            .on('ready', doReady);
        setTimeout(doReady, 100);
    });
})();