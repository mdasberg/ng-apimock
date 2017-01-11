(function () {
    'use strict';

    function MockService($resource) {
        return $resource('/ngapimock/mocks', {}, {
            get: {
                method: 'GET',
                headers: {
                    ngapimockid: undefined
                }
            },
            update: {
                method: 'PUT',
                headers: {
                    ngapimockid: undefined
                }
            },
            setAllToPassThrough: {
                url: '/ngapimock/mocks/passthroughs',
                method: 'PUT',
                headers: {
                    ngapimockid: undefined
                }
            },
            setAllToDefault: {
                url: '/ngapimock/mocks/defaults',
                method: 'PUT',
                headers: {
                    ngapimockid: undefined
                }
            },
            toggleRecord: {
                method: 'PUT',
                url: '/ngapimock/mocks/record',
                headers: {
                    ngapimockid: undefined
                }
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