(function () {
    'use strict';

    function MockService($resource) {
        return $resource('/ngapimock/mocks', {}, {
            get: {
                method: 'GET'
            },
            update: {
                method: 'PUT'
            },
            setAllToPassThrough: {
                url: '/ngapimock/mocks/passthroughs',
                method: 'PUT'
            },
            setAllToDefault: {
                url: '/ngapimock/mocks/defaults',
                method: 'PUT'
            },
            toggleRecord: {
                method: 'PUT',
                url: '/ngapimock/mocks/record'
            }
        });
    }

    MockService.$inject = ['$resource'];

    /**
     * @ngdoc service
     * @name ng-apimock.ngApimockStorage
     * @description
     * # Service for mocks.
     * Service in the ng-apimock
     */
    angular
        .module('ng-apimock')
        .factory('mockService', MockService);
})();