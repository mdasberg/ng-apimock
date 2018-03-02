(function () {
    'use strict';

    function PresetsService($resource) {
        return $resource('/ngapimock/presets', {
        }, {
            get: {
                method: 'GET',
                headers: {
                    ngapimockid: undefined
                }
            }
        });
    }

    PresetsService.$inject = ['$resource'];

    /**
     * @ngdoc service
     * @name ng-apimock.ngApimockStorage
     * @description
     * # Service for mocks.
     * Service in the ng-apimock
     */
    angular
        .module('ng-apimock')
        .factory('presetsService', PresetsService);
})();