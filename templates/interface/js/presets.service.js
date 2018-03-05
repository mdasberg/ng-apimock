(function () {
    'use strict';

    function PresetService($resource) {
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

    PresetService.$inject = ['$resource'];

    /**
     * @ngdoc service
     * @name ng-apimock.ngApimockStorage
     * @description
     * # Service for mocks.
     * Service in the ng-apimock
     */
    angular
        .module('ng-apimock')
        .factory('presetService', PresetService);
})();