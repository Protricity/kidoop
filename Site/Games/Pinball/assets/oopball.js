/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){

    var interval = 100;
    var doInit = function() {

        doRender();
    };
    var doRender = function() {

    };

    jQuery(document).ready(function() {
        jQuery('body').on('render', doRender);
        setTimeout(doInit, 100);

    });
})();

