(function () {
    'use strict';

    function ShadowLogger() {
        var shadowLog = {
            info: []
        };

        return {
            write: function (message) {
                shadowLog.info.push(message);
            },
            read: function () {
                return shadowLog;
            }
        }
    }

    angular
        .module('ngApimock-example')
        .factory('shadowLogger', ShadowLogger);

    angular
        .module('ngApimock-example')
        .config(['$provide', function ($provide) {
            $provide.decorator('$log', ['$delegate', 'shadowLogger', function ($delegate, shadowLogger) {
                var origDebug = $delegate.info;

                $delegate.info = function () {
                    shadowLogger.write(arguments);
                    origDebug.apply(null, arguments)
                };

                return $delegate;
            }]);
        }])
})();

