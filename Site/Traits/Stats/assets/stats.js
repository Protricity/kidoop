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

    var updateStats = function(e) {
        var statsBoxes = document.getElementsByClassName(STATS_BOX_CLASS);
        if(statsBoxes.length === 0) {
            var defaultStatsBox = document.createElement('div');
            defaultStatsBox.classList.add(STATS_BOX_CLASS);
            defaultStatsBox.style.position = 'absolute';
            document.body.appendChild(defaultStatsBox);
        }

        if(statsBoxes[0].style.position === 'absolute') {
            statsBoxes[0].style.left = e.pageX + 'px';
            statsBoxes[0].style.top = (e.pageY + 50) + 'px';
        }

        var statsObjects = document.getElementsByClassName(STATS_TARGET_CLASS);
        if(statsObjects.length = 0)
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
        var html = "<li>" + object.nodeName + ' ' + object.getAttribute('class') + "</li>";

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
                statsBox.appendChild(defaultStats = document.createElement('div'));
                defaultStats.classList.add(STATS_DEFAULT_CLASS);
            }
            defaultStats.innerHTML = html;
        }
    };

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
                    var x = e.offsetX==undefined ? e.layerX : e.offsetX;
                    var y = e.offsetY==undefined ? e.layerY : e.offsetY;
                    x = x - child.offsetLeft;
                    y = y - child.offsetTop;
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
//         console.log(stats);
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