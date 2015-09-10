(function(){
    angular.module('location-retriever', ['ionic'])
        .factory('LocationRetriever', LocationRetriever);

    /*@ngInject*/
    function LocationRetriever($q){
        var defOpts = {
            maxRepeat:5,
            accuracy:10,
            timeout:20000,
            enableHighAccuracy : true
        };

        var service = navigator.geolocation;

        var api = {
            retrieveLocation: retrieveLocation,
            overrideService: overrideService
        };

        return api;

        function overrideService(newService) {
            service = newService;
        }

        function retrieveLocation(options){
            var opts = angular.copy(defOpts);
            if (options !== null && angular.isObject(options)) {
                opts.maxRepeat = (options.maxRepeat) ? options.maxRepeat : opts.maxRepeat;
                opts.accuracy = (options.accuracy) ? options.accuracy : opts.accuracy;
                opts.timeout = (options.timeout) ? options.timeout : opts.timeout;
                opts.enableHighAccuracy = (options.enableHighAccuracy) ? options.timeout : opts.enableHighAccuracy;
            }

            return $q(function(resolve, reject) {
                ionic.Platform.ready(function(){
                    startRetrieval(opts, resolve, reject);
                });
            });
        }

        function startRetrieval(opts, resolve, reject) {
            var ctx = {};
            var firstTime = true;
            ctx.watchId = service.watchPosition(function(position){
                    if (firstTime) {
                        ctx.currentPosition = position;
                        firstTime = false;
                        retrieveLocations(0, resolve, reject, opts, ctx);
                    }
                }, function(err){
                    err.bestPosition = null;
                    reject(err);
                },{
                    timeout:opts.timeout,
                    enableHighAccuracy: opts.enableHighAccuracy
                }
            );
        }

        function retrieveLocations(count, resolve, reject, opts,ctx) {
            service.getCurrentPosition(function(position){
                if (position.coords.accuracy <= opts.accuracy) {
                    closeWatch(ctx);
                    resolve(position);
                } else {
                    //accuracy was too low... how many repeats have we done
                    count += 1;
                    ctx.currentPosition = checkPositions(position, ctx.currentPosition);
                    if (count >= opts.maxRepeat) {

                        closeWatch(ctx);
                        var err = {code:999, message:'Too many repetitions', bestPosition:ctx.currentPosition}
                        reject(err);
                    } else {
                        retrieveLocations(count, resolve, reject, opts, ctx);
                    }
                }
            },
            function(err){
                closeWatch(ctx);
                err.bestPosition = ctx.currentPosition;
                reject(err);

            }, {
                timeout:opts.timeout,
                enableHighAccuracy: opts.enableHighAccuracy
            });
        }

        function closeWatch(ctx) {
            service.clearWatch(ctx.watchId);
        }

        function checkPositions(pos1, pos2) {
            return pos1.coords.accuracy > pos2.coords.accuracy ? pos1 : pos2;
        }
    }
})();