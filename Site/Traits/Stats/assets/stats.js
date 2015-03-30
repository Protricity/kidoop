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

    var updateStats = function() {
        var statsBoxes = document.getElementsByClassName(STATS_BOX_CLASS);
        if(statsBoxes.length === 0) {
            statsBoxes = [document.createElement(STATS_BOX_CLASS)];
            document.body.appendChild(statsBoxes[0]);
            statsBoxes[0].style.position = 'absolute';
        }

        var statsObjects = document.getElementsByClassName(STATS_CLASS);
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
            var defaultStats = statsBox.getElementsByClassName(STATS_DEFAULT_CLASS);
            if(defaultStats.length === 0) {
                defaultStats = [document.createElement('div')];
                statsBox.appendChild(defaultStats[0]);
                defaultStats[0].classList.add(STATS_DEFAULT_CLASS);
            }
            defaultStats[0].innerHTML = html;
        }
    };

    var onMouse = function(e) {
        if(typeof e.target.classList === 'undefined')
            return;
        
        var i;
        switch(e.type) {
            case 'click':
            case 'mouseenter':
            case 'mouseover':
                var stats = document.getElementsByClassName(STATS_CLASS);
                for(i=0; i<stats.length; i++)
                    stats[i].classList.remove(STATS_CLASS);
                e.target.classList.add(STATS_CLASS);

                var distTarget = [1000000,null];
                for(i=0; i<e.target.children.length; i++) {
                    var child = e.target.children[i];
                    var x = e.offsetX - child.offsetTop;
                    var y = e.offsetY - child.offsetLeft;
                    var dist = Math.sqrt(x*x + y*y);
                    if(dist < distTarget[0]) {
                        distTarget = [dist, child];
                    }
                }
                console.log("Child: ", distTarget);

                updateStats();

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

    document.addEventListener('click', onMouse, false);
    document.addEventListener('mouseover', onMouse);
    document.addEventListener('mouseenter', onMouse);
//     document.addEventListener('mouseleave', onMouse, false);
})();