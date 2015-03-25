/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    var WARP_ITEM_CLASS = 'warp-item';

    var onCollision = function(e) {
        var warp = e.target;
        var target = e.detail.withElement;

        if(!target)
            return false;

        if(!warp.classList.contains('warp') && warp.nodeName.toLowerCase() !== 'warp')
            return false;

        var targetClass = warp.dataset.target;
        if(!targetClass)
            throw new Error("Warp target not found: " + targetClass);

        var targetElm = document.getElementsByClassName(targetClass);
        if(!targetElm.length)
            throw new Error("Warp not found by class: " + targetClass);
        targetElm = targetElm[0];

        e.preventDefault();
        targetElm.appendChild(target);
        target.dispatchEvent(new CustomEvent("warp",
            {
                bubbles: true,
                cancelable: true,
                detail: {
                    warp: targetElm
                }
            }
        ));
        target.style.left = 0;
        target.style.top = 0;
    };

    if(typeof document.warp_js !== 'undefined')
        return;

    document.warp_js = true;
    document.addEventListener('collision', onCollision, false);
})();