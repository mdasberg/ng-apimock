(function () {
    'use strict';

    function VariableService($resource) {
        return $resource('/ngapimock/variables', {
        }, {
            get: {
                method: 'GET',
                cache: true,
                isArray: false
            },
            addOrUpdate: {
                method: 'PUT',
                isArray: false
            },
            delete: {
                url: '/ngapimock/variables/:key',
                method: 'DELETE',
                isArray: false
            }
        });
    }

    VariableService.$inject = ['$resource'];

    /**
     * @ngdoc service
     * @name ng-apimock.ngApimockStorage
     * @description
     * # Service for mocks.
     * Service in the ng-apimock
     */
    angular
        .module('ng-apimock')
        .factory('variableService', VariableService);
})();