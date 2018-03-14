(function () {
    'use strict';

    function MockingController(mockService, presetService, variableService, $interval, $scope, $window) {
        var vm = this;
        var interval;

        vm.echoMock = echoMock;
        vm.delayMock = delayMock;
        vm.toggleRecording = toggleRecording;
        vm.selectMock = selectMock;
        vm.defaultMocks = defaultMocks;
        vm.passThroughMocks = passThroughMocks;
        vm.addVariable = addVariable;
        vm.updateVariable = updateVariable;
        vm.deleteVariable = deleteVariable;
        vm.applyPreset = applyPreset;
        vm.exportAsPreset = exportAsPreset;

        vm.$onInit = function () {
            fetchMocks();
            fetchPresets();
            fetchVariables();

            vm.variable = {
                key: undefined,
                value: undefined
            };
        };

        /** Fetch all the mocks and make them available. */
        function fetchMocks() {
            mockService.get({}, function (response) {
                vm.mocks = response.mocks.map(function(mock){
                    Object.keys(mock.responses).forEach(function(response) {
                        mock.responses[response].name = response;
                    });
                    return mock;
                });
                vm.selections = response.selections;
                vm.delays = response.delays;
                vm.echos = response.echos;
                vm.recordings = response.recordings;
                vm.record = response.record;
                if (vm.record) {
                    interval = $interval(refreshMocks, 5000);
                }
            });
        }

        /** Fetch all the variables and make them available. */
        function fetchVariables() {
            variableService.get({}, function (response) {
                vm.variables = response;
            });
        }

        /** Fetch all the presets and make them available. */
        function fetchPresets() {
            presetService.get({}, function (response) {
                vm.presets = response;
            });
        }

        /**
         * Refresh the mocks from the connect server
         */
        function refreshMocks() {
            mockService.get({}, function (response) {
                angular.merge(vm.mocks, response.mocks);
                vm.selections = response.selections;
            });
        }

        /**
         * Update the given Echo indicator.
         * @param mock The mock.
         * @param echo The echo.
         */
        function echoMock(mock, echo) {
            mockService.update({'identifier': mock.identifier, 'echo': echo}, function () {
                vm.echos[mock.identifier] = echo;
            });
        }

        /**
         * Update the given Delay time.
         * @param mock The mock.
         * @param delay The delay.
         */
        function delayMock(mock, delay) {
            mockService.update({'identifier': mock.identifier, 'delay': delay}, function () {
                vm.delays[mock.identifier] = delay;
            });
        }

        /** Toggle the recording. */
        function toggleRecording() {
            mockService.toggleRecord({}, function (response) {
                vm.record = response.record;
                if (vm.record) {
                    interval = $interval(refreshMocks, 5000);
                } else {
                    $interval.cancel(interval);
                    refreshMocks();
                }
            });
        }

        /**
         * Select the given response.
         * @param mock The mock.
         * @param selection The selection.
         */
        function selectMock(mock, selection) {
            mockService.update({'identifier': mock.identifier, 'scenario': selection || 'passThrough'}, function () {
                console.log('selected mock', mock.identifier, selection);
                vm.selections[mock.identifier] = selection;
            });
        }

        /** Reset all selections to default. */
        function defaultMocks() {
            mockService.setAllToDefault({}, function () {
                $window.location.reload();
            });
        }

        /** Reset all selections to passThrough. */
        function passThroughMocks() {
            mockService.setAllToPassThrough({}, function () {
                $window.location.reload();
            });
        }

        /** Adds the given variable. */
        function addVariable() {
            variableService.addOrUpdate(vm.variable, function () {
                vm.variables[vm.variable.key] = vm.variable.value;
                vm.variable = {
                    key: undefined,
                    value: undefined
                };
            });
        }

        /**
         * Update the given variable.
         * @param key The key.
         * @param value The value.
         */
        function updateVariable(key, value) {
            variableService.addOrUpdate({key: key, value: value}, function () {
                vm.variables[key] = value;
                vm.variable = {
                    key: undefined,
                    value: undefined
                };
            });
        }

        /**
         * Delete the variable matching the given key.
         * @param key The key.
         */
        function deleteVariable(key) {
            variableService.delete({key: key}, function () {
                delete vm.variables[key];
            });
        }

        /**
         * Show the current selection as preset json, so it can be exported
         */
        function exportAsPreset() {
            vm.exportPreset = JSON.stringify({
                name: "[preset name]",
                scenarios: vm.selections
            }, null, 2);
        }

        /**
         * Apply the provided preset
         * @param preset The preset to apply
         */
        function applyPreset(preset) {
            presetService.applyPreset(preset, function () {
                $window.location.reload();
            });
        }
    }

    MockingController.$inject = ['mockService', 'presetService', 'variableService', '$interval', '$scope', '$window'];

    /**
     * @ngdoc controller
     * @module ng-apimock
     * @name NgApimockController
     * @description
     * # Controller for selecting mocks.
     * Controller in the ng-apimock
     */
    angular
        .module('ng-apimock')
        .controller('NgApimockController', MockingController);
})();