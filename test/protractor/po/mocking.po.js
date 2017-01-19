(function () {
    'use strict';

    /**
     * Mocking page object.
     * @constructor
     */
    var MockingPO = function () {
        /** Get all the mocks. */
        this.mocks = element.all(by.repeater('mock in $ctrl.mocks'));
        /** Get the mock by name. */
        this.mock = function (name) {
            return new MockPO(this.mocks.filter(function (mock) {
                return mock.getAttribute('identifier').then(function (identifier) {
                    return identifier === name;
                });
            }).first());
        };

        this.record = element(by.model('$ctrl.record'));
        this.setToPassThroughs = element(by.buttonText('All to passThrough'));
        this.resetsToDefaults = element(by.buttonText('Reset to defaults'));

        this.addVariable = function (key, value) {
            return element(by.model('$ctrl.variable.key')).clear().sendKeys(key).then(function () {
                return element(by.model('$ctrl.variable.value')).clear().sendKeys(value).then(function () {
                    return element(by.buttonText('Add variable')).click();
                });
            });
        };
        this.updateVariable = function (key, value) {
            return element(by.id(key)).element(by.tagName('input')).clear().sendKeys(value).then(function () {
                return browser.sleep(501); // debounce of 500
            });
        };
        this.deleteVariable = function (key) {
            return element(by.id(key)).element(by.tagName('button')).click();
        };
    };

    var RecordingsPO = function (container) {
        this.container = container;
        this.show = this.container.element(by.linkText('Show'));
        this.hide = this.container.element(by.linkText('Hide'));
        this.records = this.container.all(by.repeater('recording in $ctrl.recordings[mock.identifier]')).filter(function(recording) {
            return recording.element(by.binding('recording.url')).isPresent();
        });
    };

    var MockPO = function (container) {
        this.container = container;
        this.expression = this.container.element(by.binding('::mock.expression.toString()'));
        this.method = this.container.element(by.binding('::mock.method'));
        this.name = this.container.element(by.binding('::mock.name'));
        this.scenario = this.container.element(by.tagName('select'));
        this.delay = this.container.element(by.model('delay'));
        this.echo = this.container.element(by.model('echo'));
        this.recordings = new RecordingsPO(this.container);
        this.isPresent = function() {
            return this.container.isPresent();
        }
    };

    module.exports = MockingPO;
})();