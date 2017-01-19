(function () {
    'use strict';

    /**
     * Test page object.
     * @constructor
     */
    var TestPO = function () {
        this.list = {
            data: element(by.binding('$ctrl.list.data')),
            error: element(by.binding('$ctrl.list.error')),
            refresh: element(by.buttonText('refresh')),
            refreshJsonp: element(by.buttonText('refresh with jsonp callback')),
            loading: element(by.name('loading'))
        };

        this.update = {
            button: element(by.buttonText('post me')),
            data: element(by.binding('$ctrl.update.data')),
            error: element(by.binding('$ctrl.update.error'))
        };

        this.download = {
            button: element(by.buttonText('download'))
        };

        this.switch = element(by.id('mocking'));
    };

    module.exports = TestPO;
})();