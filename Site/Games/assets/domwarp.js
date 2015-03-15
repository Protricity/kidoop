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
            var elm1 = e.target;
            var elm2 = e.detail.with;

            if(!elm1.classList.contains('warp')) 
                return false;
            
            if(elm2.classList.contains('warp')) 
                return false;

            var warps = document.getElementsByClassName('warp');

            if(typeof elm2.warpID === 'undefined')
                elm2.warpID = 0;
            else 
                elm2.warpID++;
            if(elm2.warpID >= warps.length)
                elm2.warpID = 0;

            var warp = warps[elm2.warpID];
            warp.parentNode.appendChild(elm2);
            elm2.dispatchEvent(new CustomEvent("warp", { detail: {
                warp: warp
            }}));
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