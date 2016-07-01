(function () {
    'use strict';

    /**
     * Mocking page object.
     * @constructor
     */
    var MockingPO = function () {
        var openDetailCounter = 0;

        this.partials = element(by.name('partials/.*$$GET'));
        this.getAllTodos = element(by.name('online/rest/some/api/.*/and/.*$$GET'));
        this.updateTodo = element(by.name('online/rest/some/api/.*/and/.*$$POST'));
        this.getPdfDownload = element(by.name('online/rest/some/api/pdf$$GET'));
        this.echoPOST = element(by.model('echo'));
        this.record = element(by.model('ctrl.record'));
        this.recordings = function(index) {
            return element.all(by.repeater('mock in ctrl.mocks')).get(index + openDetailCounter).all(by.binding('recording.url'));
        };
        this.showRecordings = function (index) {
            return element.all(by.repeater('mock in ctrl.mocks')).get(index).element(by.linkText('Show')).click().then(function(){
                openDetailCounter++;
            });
        };
        this.hideRecordings = function (index) {
            return element.all(by.repeater('mock in ctrl.mocks')).get(index).element(by.linkText('Hide')).click().then(function() {
                openDetailCounter--;
            });
        };
        this.passThrough = function() {
            return element(by.buttonText('All to passThrough')).click();
        };
        this.defaults = function() {
            return element(by.buttonText('Reset to defaults')).click();
        };
        this.addVariable = function(key, value) {
            return element(by.model('ctrl.variable.key')).clear().sendKeys(key).then(function () {
                return element(by.model('ctrl.variable.value')).clear().sendKeys(value).then(function () {
                    return element(by.buttonText('Add variable')).click();
                });
            });
        };
        this.updateVariable = function(key, value) {
            return element(by.id(key)).element(by.tagName('input')).clear().sendKeys(value).then(function () {
                return browser.sleep(501); // debounce of 500
            });
        };
        this.deleteVariable = function(key) {
            return element(by.id(key)).element(by.tagName('button')).click();
        };
    };

    module.exports = MockingPO;
})();