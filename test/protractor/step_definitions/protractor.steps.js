(function () {
    module.exports = function () {
        var fs = require('fs-extra'),
            path = require('path'),
            responses = {
                list: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-list.json')).responses,
                update: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-post.json')).responses,
                download: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-download.json')).responses
            };

        this.Given(/^a mock with name (.*) has marked (.*) as its default scenario$/, function (name, scenario) {
            return expect(responses[name][scenario]['default']).to.be.true;
        });

        this.Given(/^a mock with name (.*) has no scenario marked as default$/, function (name) {
            expect(Object.keys(responses[name]).filter(function (scenario) {
                return responses[name][scenario].default || false;
            }).length).to.equal(0);
        });

        this.When(/^I select (.*) for mock with name (.*)$/, function (scenario, name) {
            return ngApimock.selectScenario(name, scenario);
        });

        this.When(/^I reset the scenario's to defaults$/, function () {
            return ngApimock.setAllScenariosToDefault();
        });

        this.When(/^I reset the scenario's to passThroughs$/, function () {
            return ngApimock.setAllScenariosToPassThrough();
        });

        this.When(/^I add variable (.*) with value (.*)$/, function (name, value) {
            return ngApimock.setGlobalVariable(name, value);
        });

        this.When(/^I update variable (.*) with value (.*)$/, function (name, value) {
            return ngApimock.setGlobalVariable(name, value);
        });

        this.When(/^I delete variable (.*)$/, function (name) {
            return ngApimock.deleteGlobalVariable(name);
        });

        this.When(/^I (enable|disable) echo for mock with name (.*)/, function (able, name) {
            return ngApimock.echoRequest(name, able === 'enable');
        });

        this.Then(/^echoing should be (enabled|disabled) for mock with name (.*)/, function (able, name) {
            // no idea how I can check the server log for now check manually
        });

        this.Then(/^I delay the response for mock with name (.*) for (\d+) milliseconds$/, function (name, delay) {
            browser.ignoreSynchronization = true;
            return ngApimock.delayResponse(name, parseInt(delay));
        });
    };
})();
