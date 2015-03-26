/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

    // Game Constants
    var WIN_COUNT = 6;

    // Game Logic
    var onDrop = function(e) {
        var Output = document.getElementsByClassName('oopball-output')[0];
        var win = Output.children.length >= WIN_COUNT;
        win ? Output.classList.add('win')
            : Output.classList.remove('win');
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