/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    if(typeof document._stats_js !== 'undefined')
        return;

    document._stats_js = true;

    var STATS_CLASS = 'stats';

    var onMouse = function(e) {
        if(typeof e.target.classList === 'undefined')
            return;
        var stats = document.getElementsByClassName('stats');
        switch(e.type) {
            case 'click':
                for(var i=0; i<stats.length; i++)
                    stats[i].classList.remove(STATS_CLASS);
                e.target.classList.add(STATS_CLASS);
                break;
            default:
                throw new Error("Unknown: " + e.type);
        }
        console.log(stats);
    };

    var onRender = function(e) {
        var stats = document.getElementsByClassName(STATS_CLASS);
        for(var i=0; i<stats.length; i++) {
        }
        //console.log(stats);
    };

    document.addEventListener('render', onRender, false);

    document.addEventListener('click', onMouse, false);
//     document.addEventListener('mouseenter', onMouse, false);
//     document.addEventListener('mouseleave', onMouse, false);
})();