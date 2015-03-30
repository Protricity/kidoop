/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    // Include

    var include = function(src) {
        if(/\.js$/i.test(src)) {
            var scripts = document.head.getElementsByTagName('script');
            for(var si=0; si<scripts.length; si++)
                if(scripts[si].getAttribute('src') == src)
                    return false;

            var script = document.createElement('script');
            script.setAttribute('src', src);
            document.head.appendChild(script);
            return true;

        } else if (/\.css$/i.test(src)) {
            var links = document.head.getElementsByTagName('link');
            for(var li=0; li<links.length; li++)
                if(links[li].getAttribute('href') == src)
                    return false;

            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', src);
            document.head.appendChild(link);
            return true;
        } else {
            throw new Error("Invalid SRC: " + src);
        }
    };

    include('Site/Traits/Draggable/assets/draggable.js');
    include('Site/Traits/Draggable/assets/draggable.css');

    include('Site/Objects/Circle/assets/circle.js');
    include('Site/Objects/Circle/assets/circle.css');

    include('Site/Traits/Stats/assets/stats.js');
    include('Site/Traits/Stats/assets/stats.css');

    // Methods

    var marballs = null;
    var initMarball = function(e) {
        if(marballs === null)
            marballs = document.getElementsByTagName('marball');
        for(var i=0; i<marballs.length; i++) {
            var marball = marballs[i];
            if(!marball.style.left) 
                marball.style.left = marball.offsetLeft + 'px';
            if(!marball.style.top) 
                marball.style.top = marball.offsetTop + 'px';
        }
        
        // Add circle class after position init
        for(i=0; i<marballs.length; i++) {
            marball = marballs[i];
            if(!marball.classList.contains('circle'))
                marball.classList.add('circle');
            if(!marball.classList.contains('stats'))
                marball.classList.add('stats');
        }
    };
    document.addEventListener('init', initMarball);
    setTimeout(initMarball, 1000);

})();