(function () {
    'use strict';

    function Api($resource) {
        return $resource('/online/rest/some/api/:x/and/:y', {
            x: '@x',
            y: '@y'
        }, {
            fetch: {
                method: 'GET',
                isArray: true
            },
            update: {
                method: 'POST',
                isArray: false
            }
        });
    }

    Api.$inject = ['$resource'];

    angular
        .module('ngApimock-example')
        .service('api', Api);

})();