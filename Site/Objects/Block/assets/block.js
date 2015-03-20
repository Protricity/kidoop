/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    var onCollision = function(e) {
        var elm1 = e.target;
        var elm2 = e.detail.with;

        if(elm1.nodeName.toLowerCase() !== 'warp')
            return false;

        if(elm2.nodeName.toLowerCase() === 'warp')
            return false;

        var targetClass = e.target.dataset.target;
        if(!targetClass)
            return console.error("Warp not found: " + targetClass);

        var targetElm = document.getElementsByClassName(targetClass);
        if(!targetElm.length)
            return console.error("Warp not found by class: " + targetClass);
        targetElm = targetElm[0];

        //var warps = document.getElementsByClassName('warp');

        //if(typeof elm2.warpID === 'undefined')
        //    elm2.warpID = 0;
        //else
        //    elm2.warpID++;
        //if(elm2.warpID >= warps.length)
        //    elm2.warpID = 0;

        //var warp = warps[elm2.warpID];
        targetElm.appendChild(elm2);
        elm2.dispatchEvent(new CustomEvent("warp", { detail: {
            warp: targetElm
        }}));
        elm2.dataset.x = 0;
        elm2.dataset.y = 0;
    };

    var onReady = function() {
        if(typeof document.warp_js !== 'undefined')
            return;

        document.warp_js = true;
        document.addEventListener('collision', onCollision, false);
    };

    document.addEventListener('DOMContentLoaded', onReady);
    document.addEventListener('ready', onReady);
})();