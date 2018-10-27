(function () {
    'use strict';

    function DummyController(api, shadowLogger) {
        var vm = this;

        vm.$onInit = function () {
            getList();
        };

        vm.refresh = getList;
        vm.refreshJsonP = getListJsonP;
        vm.post = post;
        vm.download = download;
        vm.logging = shadowLogger.read().info;


        /** Gets the list of things. */
        function getList() {
            vm.loading = true;
            api.fetch({x: 'x', y: 'y'}, function (data) {
                vm.list = {
                    data: data,
                    error: undefined
                };
                vm.loading = false;
            }, function (response) {
                vm.loading = false;
                vm.list = {
                    data: undefined,
                    error: response.status
                };
            });
        }

        /** Gets the list of things. */
        function getListJsonP() {
            vm.loading = true;
            api.fetchAsJsonP({x: 'x', y: 'y'}, function (data) {
                vm.list = {
                    data: data,
                    error: undefined
                };
                vm.loading = false;
            }, function (response) {
                vm.loading = false;
                vm.list = {
                    data: undefined,
                    error: response.status
                };
            });
        }

        /** Posts the data. */
        function post(data) {
            api.post({
                x: 'x',
                y: 'y',
                data: data
            }, function (data) {
                vm.response = {
                    data: data,
                    error: undefined
                };
            }, function (response) {
                vm.response = {
                    data: undefined,
                    error: response.status
                };
            });
        }

        /** Download the pdf. */
        function download() {
            api.download({});
        }
    }

    DummyController.$inject = ['api', 'shadowLogger'];

    angular
        .module('ngApimock-example')
        .controller('DummyController', DummyController);

})();
