(function () {
    'use strict';

    function MockingController(mockService, variableService, $interval) {
        var vm = this;
        var interval;

        /** Get the mocks.*/
        mockService.get({}, function (response) {
            vm.mocks = response.mocks;
            vm.selections = response.selections;
            vm.record = response.record;
            if (vm.record) {
                interval = $interval(refreshMocks, 5000);
            }
        });
        /**
         * Refresh the mocks from the connect server
         */
        function refreshMocks() {
            mockService.get({}, function (response) {
                angular.merge(vm.mocks, response.mocks);
                vm.selections = response.selections;
            });
        }

        /** Get the variables.*/
        variableService.get({}, function (response) {
            vm.variables = response;
        });

        vm.variable = {
            key: undefined,
            value: undefined
        };

        /**
         * Update the given Echo indicator.
         * @param mock The mock.
         * @param echo The echo.
         */
        vm.echoMock = function (mock, echo) {
            mockService.update({'identifier': mock.identifier, 'echo': echo}, function () {
                console.log(vm.mocks.find(function (m) {
                    return m.name === mock.name;
                }).echo = echo);
            });
        };

        /**
         * Toggle the recording function 
         */
        vm.toggleRecording = function () {
            mockService.toggleRecord({}, function (response) {
                vm.record = response.record;
                if (vm.record) {
                    interval = $interval(refreshMocks, 5000);
                } else {
                    $interval.cancel(interval);
                    refreshMocks();
                }
            });
        };

        /**
         * Select the given response.
         * @param mock The mock.
         * @param selection The selection.
         */
        vm.selectMock = function (mock, selection) {
            mockService.update({'identifier': mock.identifier, 'scenario': selection}, function () {
                vm.selections[mock.identifier] = selection;
            });
        };

        /** Reset all selections to default. */
        vm.defaultMocks = function () {
            mockService.setAllToDefault({}, function (response) {
                vm.mocks = response.mocks;
                vm.selections = response.selections;
            });
        };

        /** Reset all selections to passThrough. */
        vm.passThroughMocks = function () {
            mockService.setAllToPassThrough({}, function (response) {
                vm.mocks = response.mocks;
                vm.selections = response.selections;
            });
        };


        /** Adds the given variable. */
        vm.addVariable = function() {
            variableService.addOrUpdate(vm.variable, function() {
                vm.variables[vm.variable.key] = vm.variable.value;
                vm.variable = {
                    key: undefined,
                    value: undefined
                };
            });
        };

        /**
         * Update the given variable.
         * @param key The key.
         * @param value The value.
         */
        vm.updateVariable = function (key, value) {
            variableService.addOrUpdate({key: key, value: value}, function () {
                vm.variables[key] = value;
                vm.variable = {
                    key: undefined,
                    value: undefined
                };
            });
        };

        /**
         * Delete the variable matching the given key.
         * @param key The key.
         */
        vm.deleteVariable = function (key) {
            variableService.delete({key: key}, function () {
                delete vm.variables[key];
            });
        };
    }

    MockingController.$inject = ['mockService', 'variableService', '$interval'];

    /**
     * @ngdoc controller
     * @name ng-apimock.ngApimockController
     * @description
     * # Controller for selecting mocks.
     * Controller in the ng-apimock
     */
    angular
            .module('ng-apimock')
            .controller('NgApimockController', MockingController);
})();