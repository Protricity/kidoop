/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

    // Game Constants
    var WIN_COUNT = 6;

    // Game Logic
    var onDrop = function(e) {
        var output = document.getElementsByClassName('output')[0];
        var marballs = output.getElementsByTagName('marball');
        var win = marballs.length >= WIN_COUNT;
        win ? output.classList.add('win')
            : output.classList.remove('win');

        if(win) {
            for(var i=0; i<marballs.length; i++) {
                marballs[i].dataset.ax = parseInt(32 - Math.random() * 64);
                marballs[i].dataset.ay = parseInt(32 - Math.random() * 64);
            }
        }
    };

    document.addEventListener('warp', onDrop);


    var doRender = function() {
        var renderEvent = new CustomEvent('render');
        document.dispatchEvent(renderEvent);
    };
    var renderInterval = setInterval(doRender, 30);

    document.addEventListener('pause', function() { 
        clearInterval(renderInterval); 
    });
    document.addEventListener('resume', function() { 
        clearInterval(renderInterval); 
        renderInterval = setInterval(doRender, 30)
    });
})();