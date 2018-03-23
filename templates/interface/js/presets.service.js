(function () {
    'use strict';

    function PresetService($resource) {
        return $resource('/ngapimock/presets', {
        }, {
            get: {
                method: 'GET',
                isArray: true,
                headers: {
                    ngapimockid: undefined
                }
            },
            applyPreset: {
                method: 'PUT',
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