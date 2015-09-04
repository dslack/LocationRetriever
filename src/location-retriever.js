(function(){
    angular.module('location-retriever', ['ionic'])
        .factory('LocationRetriever', LocationRetriever);

    function LocationRetriever($q){
        var defOpts = {
            maxRepeat:5,
            accuracy:10,
            timeout:20000,
            enableHighAccuracy : true
        };

        var api = {
            retrieveLocation: retrieveLocation
        };

        return api;

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
            ctx.watchId = navigator.geolocation.watchPosition(function(position){
                    if (firstTime || (firstTime = false)) {
                        retrieveLocations(0, resolve, reject, opts, ctx);
                    }
                }, function(err){
                    reject(err);
                },{
                    timeout:opts.timeout,
                    enableHighAccuracy: opts.enableHighAccuracy
                }
            );
        }

        function retrieveLocations(count, resolve, reject, opts,ctx) {
            navigator.geolocation.getCurrentPosition(function(position){
                    if (position.coords.accuracy <= opts.accuracy) {
                        closeWatch(ctx);
                        resolve(position);
                    } else {
                        //accuracy was too low... how many repeats have we done
                        count += 1;
                        if (count >= opts.maxRepeat) {
                            closeWatch(ctx);
                            reject({error:'repeats', msg:'Too many repetitions'});
                        } else {
                            retrieveLocations(count, resolve, reject, opts, ctx);
                        }
                    }
                },
                function(err){
                    reject(err);
                }, {
                    timeout:opts.timeout,
                    enableHighAccuracy: opts.enableHighAccuracy
                }
            );
        }

        function closeWatch(ctx) {
            navigator.geolocation.clearWatch(ctx.watchId);
        }
    }
})();