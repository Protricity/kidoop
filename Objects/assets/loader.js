/**
 * Created by ari on 3/27/2015.
 */
(function() {


    var onReady = function() {
        loadElement(document.body);

        var objects = document.getElementsByTagName('object');
        for(var i=0; i<objects.length; i++) {
            var object = objects[i];
//             object.addEventListener('load', function(e) {
//                 var svgDoc = this.contentDocument.getElementsByTagName('svg')[0]; //get the inner DOM of alpha.svg
//                 console.log([e, svgDoc]);
//             })
        }
    };

    document.addEventListener('DOMContentLoaded', onReady);





    //it's important to add an load event listener to the object, as it will load the svg doc asynchronously
    document.addEventListener("load",function(e){
        console.log(e);
        var svgDoc = a.contentDocument; //get the inner DOM of alpha.svg
        var delta = svgDoc.getElementById("delta"); //get the inner element by id
        delta.addEventListener("mousedown",function(){alert('hello world!')},false);    //add behaviour
    },false);


}());