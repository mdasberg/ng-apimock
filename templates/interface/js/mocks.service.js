(function () {
    'use strict';

    function MockService($resource) {
        return $resource('/ngapimock/mocks', {}, {
            get: {
                method: 'GET',
                cache: true,
                isArray: false
            },
            update: {
                method: 'PUT',
                isArray: false
            },
            setAllToPassThrough: {
                url: '/ngapimock/mocks/passthroughs',
                method: 'PUT',
                isArray: false
            },
            setAllToDefault: {
                url: '/ngapimock/mocks/defaults',
                method: 'PUT',
                isArray: false
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