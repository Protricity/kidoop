/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

    var initObject = function(element) {
        if(typeof element.domwarp !== 'undefined')
            return;
        element.domwarp = true;

        element.addEventListener('collision', function(e) {
            var elm1 = e.detail.element1;
            var elm2 = e.detail.element2;

            if(elm1.classList.contains('warp')) {
                if(elm2.classList.contains('warp')) {
                    return false;
                }
                elm2 = e.detail.element1;
                elm1 = e.detail.element2;
            } else if(!elm2.classList.contains('warp')) {
                return false;
            }

            var warps = document.getElementsByClassName('warp');

            if(typeof elm1.warpID === 'undefined')
                elm1.warpID = 0;
            else 
                elm1.warpID++;
            if(elm1.warpID >= warps.length)
                elm1.warpID = 0;

            var warp = warps[elm1.warpID];
            warp.parentNode.appendChild(elm1);
        });
    };

    var doReady = function() {
        var warps = document.getElementsByClassName('warp');
        for(var i=0; i<warps.length; i++) {
            var warp = warps[i];
            initObject(warp);
        }
    };

    jQuery(document).ready(function() {
        jQuery('body')
            .on('ready', doReady);
        setTimeout(doReady, 100);
    });
})();