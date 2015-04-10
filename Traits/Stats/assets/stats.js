/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    if(typeof document._stats_js !== 'undefined')
        return;

    document._stats_js = true;

    var STATS_CLASS = 'stats';
    var STATS_BOX_CLASS = 'stats-box';
    var STATS_DEFAULT_CLASS = 'stats-default';
    var STATS_TARGET_CLASS = 'stats-target';

    function getOffset( el ) {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }

    var oldXY = [0,0];
    var updateStats = function(e) {
        var statsBoxes = document.getElementsByClassName(STATS_BOX_CLASS);
        if(statsBoxes.length === 0) {
            var defaultStatsBox = document.createElement('div');
            defaultStatsBox.classList.add(STATS_BOX_CLASS);
            defaultStatsBox.style.position = 'absolute';
            document.body.appendChild(defaultStatsBox);
        }

        if(e && statsBoxes[0].style.position === 'absolute') {
            statsBoxes[0].style.left = (Math.round(e.pageX / 100) * 100) + 'px';
            statsBoxes[0].style.top = (Math.round(e.pageY / 100) * 100 + 100) + 'px';
            oldXY = [e.pageX, e.pageY];
            //             draw line here
        }

        var statsObjects = document.getElementsByClassName(STATS_TARGET_CLASS);
        if(statsObjects.length == 0)
            return;

        var object = statsObjects[0];

        var statsEvent = new CustomEvent('stats', {
            detail: {
                statsBoxes: statsBoxes,
                stats: {}
            },
            bubbles: true,
            cancelable: true
        });

        object.dispatchEvent(statsEvent);
        var html = "<li class='title'>" + object.nodeName + "</li>";
        html += "<li class='classes'>" + object.getAttribute('class') + "</li>";

        for(var stat in statsEvent.detail.stats) {
            if(statsEvent.detail.stats.hasOwnProperty(stat)) {
                var value = statsEvent.detail.stats[stat];

                if(typeof value === 'object') {
                    html += "<li>" + stat;
                    html += "<ul>";
                    for(var key in value) {
                        if(value.hasOwnProperty(key)) {
                            html += "\t<li>" + key + ": <span>" + value[key] + "</span></li>";
                        }
                    }
                    html += "</ul>";
                    html += "</li>";

                } else if (typeof value === 'array') {
                    for(var i=0; i<value.length; i++) {
                        html += "<li>" + stat + ": <span class='value'>" + value + "</span></li>";
                    }

                } else {
                    html = "<li><span class='stat'>" + stat + ":</span> " + value + "</li>";
                }
            }
        }

        for(var si=0; si<statsBoxes.length; si++) {
            var statsBox = statsBoxes[si];
            var defaultStats = statsBox.getElementsByClassName(STATS_DEFAULT_CLASS)[0];
            if(!defaultStats) {
                statsBox.appendChild(defaultStats = document.createElement('ul'));
                defaultStats.classList.add(STATS_DEFAULT_CLASS);
            }
            if(defaultStats.innerHTML !== html) {
                defaultStats.innerHTML = html;
            }
        }
    };
    setInterval(updateStats, 200);

    var onMouse = function(e) {
//         if(typeof e.target.classList === 'undefined')
//             return;
        
        var i;
        switch(e.type) {
            case 'mouseenter':
            case 'mouseleave':
            case 'mousemove':
                var statsTarget = document.getElementsByClassName(STATS_TARGET_CLASS);
                for(i=0; i<statsTarget.length; i++)
                    statsTarget[i].classList.remove(STATS_TARGET_CLASS);

                var stats = document.getElementsByClassName(STATS_CLASS);
                var distTarget = [1000000,null];
                for(i=0; i<stats.length; i++) {
                    var child = stats[i];
                    var x = e.pageX==undefined ? e.layerX : e.pageX;
                    var y = e.pageY==undefined ? e.layerY : e.pageY;
                    x -= (window.pageXOffset || document.documentElement.scrollLeft)  - (document.documentElement.clientLeft || 0);
                    y -= (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0);
                    var offset = getOffset(child);
                    x = x - offset.left - child.offsetWidth / 2;
                    y = y - offset.top - child.offsetWidth / 2;
                    var dist = Math.sqrt(x*x + y*y);
                    if(dist < distTarget[0]) {
                        distTarget = [dist, child];
                    }
                }
                if(!distTarget[1])
                    return false;
                    
                distTarget[1].classList.add(STATS_TARGET_CLASS);
//                 console.log("Child: ", e.type, distTarget);

                updateStats(e);

                break;
            default:
                throw new Error("Unknown: " + e.type);
        }
    };

    var onRender = function(e) {
        var stats = document.getElementsByClassName(STATS_CLASS);
        for(var i=0; i<stats.length; i++) {
        }
        //console.log(stats);
    };

    document.addEventListener('render', onRender, false);

//     document.addEventListener('click', onMouse, false);
    document.addEventListener('mousemove', onMouse, false);
    document.addEventListener('mouseenter', onMouse, false);
    document.addEventListener('mouseleave', onMouse, false);
})();