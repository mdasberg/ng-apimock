(() => {
    const {defineSupportCode} = require('cucumber');

    defineSupportCode(function({Given, When, Then, setDefaultTimeout}) {

        setDefaultTimeout(60 * 1000);

        const fs = require('fs-extra');
        const path = require('path');
        const mockingPo = new (require('./../po/mocking.po'))();
        const mocksDirectory = path.join(process.cwd(), 'test', 'mocks', 'api');
        const responses = {
            list: fs.readJsonSync(path.join(mocksDirectory, 'some-api-list.json')).responses,
            insert: fs.readJsonSync(path.join(mocksDirectory, 'some-api-insert.json')).responses,
            update: fs.readJsonSync(path.join(mocksDirectory, 'some-api-update.json')).responses,
            download: fs.readJsonSync(path.join(mocksDirectory, 'some-api-download.json')).responses
        };

        Then(/^I switch to test page$/, () => browser.getAllWindowHandles()
            .then((handles) => browser.driver.switchTo().window(handles[1])
                .then(() => browser.driver.close()
                    .then(() => browser.driver.switchTo().window(handles[0])))));

        Given(/^a mock with name (.*) has marked (.*) as its default scenario$/, (name, scenario) =>
            expect(responses[name][scenario]['default']).to.be.true);

        Given(/^a mock with name (.*) has no scenario marked as default$/, (name) =>
            expect(Object.keys(responses[name])
                .filter(function (scenario) {
                    return responses[name][scenario].default || false;
                }).length).to.equal(0));

        Given(/^I open the mocking interface$/, () => browser.get('/mocking'));

        Then(/^the following scenario's should be selected:$/, (table) =>
            protractor.promise.all(table.hashes().map((row) => {
                const actual = mockingPo.mock(row.name).scenario.$$(('option[selected="selected"]')).first().getText();
                const expected = row.scenario;
                return expect(actual).to.eventually.equal(expected);
            })));

        When(/^I select (.*) for mock with name (.*)$/, (scenario, name) => {
            console.log('scenario', scenario);
            return mockingPo.mock(name).scenario.sendKeys(scenario);
        });

        When(/^I reset the scenario's to defaults$/, () => mockingPo.resetsToDefaults.click());

        When(/^I reset the scenario's to passThroughs$/, () => mockingPo.setToPassThroughs.click());

        When(/^I add variable (.*) with value (.*)$/, (name, value) => mockingPo.addVariable(name, value));

        When(/^I update variable (.*) with value (.*)$/, (name, value) => mockingPo.updateVariable(name, value));

        When(/^I delete variable (.*)$/, (name) => mockingPo.deleteVariable(name));

        When(/^I (enable|disable) echo for mock with name (.*)/, (able, name) =>
            mockingPo.mock(name).echo.click());

        Then(/^echoing should be (enabled|disabled) for mock with name (.*)/, (able, name) => {
            // no idea how I can check the server log for now check manually
        });

        When(/^I enable recording$/, () =>
            mockingPo.record.click());

        When(/^I (show|hide) the recordings for mock with name (.*)$/, (toggle, name) =>
            mockingPo.mock(name).recordings[toggle].click());

        Then(/^there should only be (\d+) recordings present for mock with name (.*)/, (total, name) =>
            expect(mockingPo.mock(name + '-recordings').recordings.records.count())
                .to.eventually.be.equal(parseInt(total)));

        Then(/^there should be no recordings present for mock with name (.*)/, (name) =>
            expect(mockingPo.mock(name + '-recordings').isPresent()).to.eventually.be.false);

        Then(/^I delay the response for mock with name (.*) for (\d+) milliseconds$/, (name, delay) =>
            mockingPo.mock(name).delay.clear().sendKeys(parseInt(delay))
                .then(() => browser.sleep(1000)
                    .then(() => browser.ignoreSynchronization = true))); // debounce delay
    });
})();
