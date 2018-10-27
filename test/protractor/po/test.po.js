(function () {
    'use strict';

    /**
     * Test page object.
     * @constructor
     */
    function TestPO() {
        var po = this;
        po.list = {
            data: element(by.binding('$ctrl.list.data')),
            error: element(by.binding('$ctrl.list.error')),
            refresh: element(by.buttonText('refresh')),
            refreshJsonp: element(by.buttonText('refresh with jsonp callback')),
            loading: element(by.name('loading'))
        };

        po.response = {
            data: element(by.binding('$ctrl.response.data')),
            error: element(by.binding('$ctrl.response.error'))
        }

        po.update = {
            button: element(by.buttonText('post me')),
            data: po.response.data,
            error: po.response.error
        };

        po.insert = {
            button: element(by.buttonText('insert')),
            data: po.response.data,
            error: po.response.error
        };

        po.download = {
            button: element(by.buttonText('download'))
        };

        po.switch = element(by.id('mocking'));
    }

    module.exports = TestPO;
})();
