(() => {
    const {defineSupportCode} = require('cucumber');

    defineSupportCode(function ({Given, When, Then}) {
        // The step implementation
        const fs = require('fs-extra');
        const path = require('path');
        const mocksDirectory = path.join(process.cwd(), 'test', 'mocks', 'api');
        const responses = {
            list: fs.readJsonSync(path.join(mocksDirectory, 'some-api-list.json')).responses,
            update: fs.readJsonSync(path.join(mocksDirectory, 'some-api-update.json')).responses,
            insert: fs.readJsonSync(path.join(mocksDirectory, 'some-api-insert.json')).responses,
            download: fs.readJsonSync(path.join(mocksDirectory, 'some-api-download.json')).responses
        };


        Given(/^a mock with name (.*) has marked (.*) as its default scenario$/, (name, scenario) =>
            expect(responses[name][scenario]['default']).to.be.true);

        Given(/^a mock with name (.*) has no scenario marked as default$/, (name) =>
            expect(Object.keys(responses[name])
                .filter(function (scenario) {
                    return responses[name][scenario].default || false;
                }).length).to.equal(0));

        When(/^I select (.*) for mock with name (.*)$/, (scenario, name) =>
            ngApimock.selectScenario(name, scenario));

        When(/^I reset the scenario's to defaults$/, () =>
            ngApimock.setAllScenariosToDefault());

        When(/^I reset the scenario's to passThroughs$/, () =>
            ngApimock.setAllScenariosToPassThrough());

        When(/^I add variable (.*) with value (.*)$/, (name, value) =>
            ngApimock.setGlobalVariable(name, value));

        When('I add variables', function (table) {
            let variables = {};
            table.rows().forEach((row) => {
                variables[row[0]] = row[1];
            });
            return ngApimock.setGlobalVariables(variables);
        });

        When(/^I update variable (.*) with value (.*)$/, (name, value) =>
            ngApimock.setGlobalVariable(name, value));

        When('I update variables', function (table) {
            let variables = {};
            table.rows().forEach((row) => {
                variables[row[0]] = row[1];
            });
            return ngApimock.setGlobalVariables(variables);
        });

        When(/^I delete variable (.*)$/, (name) =>
            ngApimock.deleteGlobalVariable(name));

        When(/^I (enable|disable) echo for mock with name (.*)/, (able, name) =>
            ngApimock.echoRequest(name, able === 'enable'));

        Then(/^echoing should be (enabled|disabled) for mock with name (.*)/, (able, name) => {
            // no idea how I can check the server log for now check manually
        });

        Then(/^I delay the response for mock with name (.*) for (\d+) milliseconds$/, (name, delay) => {
            browser.waitForAngularEnabled(false);
            return ngApimock.delayResponse(name, parseInt(delay));
        });
    });
})();
