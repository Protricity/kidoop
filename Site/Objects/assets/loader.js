/**
 * Created by ari on 3/27/2015.
 */
(function() {

    var commonTags = [
        '!--',
        '!DOCTYPE',
        'a',
        'abbr',
        'acronym',
        'address',
        'applet',
        'area',
        'article',
        'aside',
        'audio',
        'b',
        'base',
        'basefont',
        'bdi',
        'bdo',
        'big',
        'blockquote',
        'body',
        'br',
        'button',
        'canvas',
        'caption',
        'center',
        'cite',
        'code',
        'col',
        'colgroup',
        'datalist',
        'dd',
        'del',
        'details',
        'dfn',
        'dialog',
        'dir',
        'div',
        'dl',
        'dt',
        'em',
        'embed',
        'fieldset',
        'figcaption',
        'figure',
        'font',
        'footer',
        'form',
        'frame',
        'frameset',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'head',
        'header',
        'hr',
        'html',
        'i',
        'iframe',
        'img',
        'input',
        'ins',
        'kbd',
        'keygen',
        'label',
        'legend',
        'li',
        'link',
        'main',
        'map',
        'mark',
        'menu',
        'menuitem',
        'meta',
        'meter',
        'nav',
        'noframes',
        'noscript',
        'object',
        'ol',
        'optgroup',
        'option',
        'output',
        'p',
        'param',
        'pre',
        'progress',
        'q',
        'rp',
        'rt',
        'ruby',
        's',
        'samp',
        'script',
        'section',
        'select',
        'small',
        'source',
        'span',
        'strike',
        'strong',
        'style',
        'sub',
        'summary',
        'sup',
        'table',
        'tbody',
        'td',
        'textarea',
        'tfoot',
        'th',
        'thead',
        'time',
        'title',
        'tr',
        'track',
        'tt',
        'u',
        'ul',
        'var',
        'video',
        'wbr'
    ];

    // Include
    var ucfirst = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

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

    var loadedTags = [];
    var loadElementSupportFiles = function(element) {

    };

    var loadElement = function(element) {
        var tagName = element.tagName.toLowerCase();
//         console.log('Tag: ', tagName);
        if(commonTags.indexOf(tagName) === -1) {
            if(loadedTags.indexOf(tagName) === -1) {
                include('Site/Objects/' + ucfirst(tagName) + '/assets/' + tagName + '.js');
                include('Site/Objects/' + ucfirst(tagName) + '/assets/' + tagName + '.css');
                loadedTags.push(tagName);
            }
        }
        for(var i=0; i<element.children.length; i++) {
            loadElement(element.children[i]);
        }
    };

    var onReady = function() {
        loadElement(document.body);
    };

    document.addEventListener('DOMContentLoaded', onReady);

}());