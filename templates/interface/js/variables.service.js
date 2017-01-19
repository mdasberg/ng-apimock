(function () {
    'use strict';

    function VariableService($resource) {
        return $resource('/ngapimock/variables', {
        }, {
            get: {
                method: 'GET',
                cache: true,
                isArray: false,
                headers: {
                    ngapimockid: undefined
                }
            },
            addOrUpdate: {
                method: 'PUT',
                isArray: false,
                headers: {
                    ngapimockid: undefined
                }
            },
            delete: {
                url: '/ngapimock/variables/:key',
                method: 'DELETE',
                isArray: false,
                headers: {
                    ngapimockid: undefined
                }
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