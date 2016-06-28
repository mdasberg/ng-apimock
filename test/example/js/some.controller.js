(function () {
    'use strict';

    function SomeController(api, shadowLogger) {
        var vm = this;

        var fetch = function () {
            api.fetch({x: 'x', y: 'y'}, function (data) {
                vm.data = data;
            }, function (response) {
                vm.error = response.status;
            });
        };

        fetch();

        vm.update = function () {
            api.update(
                {
                    x: 'x', y: 'y',
                    data: {
                        some: 'thing'
                    }
                }, function (data) {
                    vm.postedData = data;
                    vm.postedError = undefined;
                }, function (response) {
                    vm.postedData = undefined;
                    vm.postedError = response.status;
                });
        };

        vm.logging = shadowLogger.read().info;

        vm.refresh = function () {
            fetch();
        }

        vm.download = function() {
            api.download({});
        }
    }

    SomeController.$inject = ['api', 'shadowLogger'];

    angular
        .module('ngApimock-example')
        .controller('SomeController', SomeController);

})();