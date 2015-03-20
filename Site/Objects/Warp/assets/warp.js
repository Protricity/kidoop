/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    var WARP_ITEM_CLASS = 'warp-item';

    var onCollision = function(e) {
        var target = e.target;
        var warp = e.detail.with;

        if(warp.nodeName.toLowerCase() !== 'warp')
            return false;

        if(target.nodeName.toLowerCase() === 'warp' || !target.classList.contains(WARP_ITEM_CLASS))
            return false;

        var targetClass = warp.dataset.target;
        if(!targetClass)
            return console.error("Warp target not found: " + targetClass);

        var targetElm = document.getElementsByClassName(targetClass);
        if(!targetElm.length)
            return console.error("Warp not found by class: " + targetClass);
        targetElm = targetElm[0];

        targetElm.appendChild(target);
        target.dispatchEvent(new CustomEvent("warp", { detail: {
            warp: targetElm
        }}));
        target.dataset.x = 0;
        target.dataset.y = 0;
    };

    if(typeof document.warp_js !== 'undefined')
        return;

    document.warp_js = true;
    document.addEventListener('collision', onCollision, false);
})();