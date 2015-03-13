/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

    var lastDragObject = null;
    var initObject = function(element) {
        if(typeof element.domdrag !== 'undefined')
            return;
        element.domdrag = true;

        //setPosition(element, getPosition(element));
        var onDrag = function(e) {
            var isPhysBox = false;
            if(this.classList.contains('physbox')) {
                isPhysBox = true;
            } else if (this.classList.contains('draggable') || this.getAttribute('draggable')) {
                lastDragObject = e.target;
                console.log("Dragging: ", lastDragObject);
            } else {
                return false;

            }
//             console.log(e.type);
            element.dataset.drag = e.type;
            switch(e.type) {
                case 'dragstart': 
//                     lastDragObject = element;
                    break;
                case 'dragover':
                    e.stopPropagation();
//                         e.dataTransfer.dropEffect = 'move';  
                    if(isPhysBox) {
//                         e.target.dr/agObject = element;
                        e.preventDefault();
                    }
                    break;
                case 'dragenter': 
                    e.target.classList.remove('dragleave');
                    e.target.classList.add('dragenter');
                break;
                case 'dragleave':
                    e.target.classList.remove('dragenter');
                    e.target.classList.add('dragleave');
                break;
                case 'drop':
                    e.target.classList.remove('dragleave');
                    e.target.classList.remove('dragenter');
                    e.target.classList.add('drop');
                    console.log("Dropping: ", lastDragObject, e);
                    if(lastDragObject !== null) {
                        lastDragObject.dataset.x = null;
                        lastDragObject.dataset.y = null;
                        e.target.appendChild(lastDragObject);
                    }
                    lastDragObject = null;
                    break;
                case 'dragend': 
                    lastDragObject = null;
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