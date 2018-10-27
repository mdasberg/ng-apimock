(function () {
    'use strict';

    /**
     * Mocking page object.
     * @constructor
     */
    function MockingPO() {
        const po = this;
        /** Get all the mocks. */
        po.mocks = element.all(by.repeater('mock in $ctrl.mocks'));
        /** Get the mock by name. */
        po.mock = (name) => new MockPO(this.mocks
            .filter((mock) => mock.getAttribute('identifier')
                .then((identifier) => identifier === name))
            .first());

        po.searchField = element(by.id('search-field'));
        po.record = element(by.model('$ctrl.record'));
        po.setToPassThroughs = element(by.buttonText('All to passThrough'));
        po.resetsToDefaults = element(by.buttonText('Reset to defaults'));

        po.addVariable = (key, value) =>
            element(by.model('$ctrl.variable.key')).clear().sendKeys(key)
                .then(() => element(by.model('$ctrl.variable.value')).clear().sendKeys(value)
                    .then(() => element(by.buttonText('Add variable')).click()));

        po.updateVariable = (key, value) =>
            element(by.id(key)).element(by.tagName('input')).clear().sendKeys(value)
                .then(() => browser.sleep(501)); // debounce of 500

        po.deleteVariable = (key) =>
            element(by.id(key)).element(by.tagName('button')).click();
    }

    function RecordingsPO(container) {
        const po = this;
        po.container = container;
        po.show = po.container.element(by.linkText('Show'));
        po.hide = po.container.element(by.linkText('Hide'));
        po.records = po.container.all(by.repeater('recording in $ctrl.recordings[mock.identifier]'))
            .filter((recording) => recording.element(by.binding('recording.url')).isPresent());
    }

    function MockPO(container) {
        const po = this;
        po.container = container;
        po.expression = po.container.element(by.binding('::mock.expression.toString()'));
        po.method = po.container.element(by.binding('::mock.method'));
        po.name = po.container.element(by.binding('::mock.name'));
        po.scenario = po.container.element(by.tagName('select'));
        po.delay = po.container.element(by.model('delay'));
        po.echo = po.container.element(by.model('echo'));
        po.recordings = new RecordingsPO(po.container);
        po.isPresent = () => po.container.isPresent();
    }

    module.exports = MockingPO;
})();