(() => {
    function InterfaceSteps() {
        const fs = require('fs-extra');
        const path = require('path');
        const mockingPo = new (require('./../po/mocking.po'))();
        const mocksDirectory = path.join(process.cwd(), 'test', 'mocks', 'api');
        const responses = {
            list: fs.readJsonSync(path.join(mocksDirectory, 'some-api-list.json')).responses,
            update: fs.readJsonSync(path.join(mocksDirectory, 'some-api-post.json')).responses,
            download: fs.readJsonSync(path.join(mocksDirectory, 'some-api-download.json')).responses
        };
        const world = this;

        world.Then(/^I switch to test page$/, () => browser.getAllWindowHandles()
            .then((handles) => browser.driver.switchTo().window(handles[1])
                .then(() => browser.driver.close()
                    .then(() => browser.driver.switchTo().window(handles[0])))));

        world.Given(/^a mock with name (.*) has marked (.*) as its default scenario$/, (name, scenario) =>
            expect(responses[name][scenario]['default']).to.be.true);

        world.Given(/^a mock with name (.*) has no scenario marked as default$/, (name) =>
            expect(Object.keys(responses[name])
                .filter(function (scenario) {
                    return responses[name][scenario].default || false;
                }).length).to.equal(0));

        world.Given(/^I open the mocking interface$/, () => browser.get('/mocking'));

        world.Then(/^the following scenario's should be selected:$/, (table) =>
            protractor.promise.all(table.hashes().map((row) => {
                const actual = mockingPo.mock(row.name).scenario.$$(('option[selected="selected"]')).first().getText();
                const expected = row.scenario;
                return expect(actual).to.eventually.equal(expected);
            })));

        world.When(/^I select (.*) for mock with name (.*)$/, (scenario, name) => {
            console.log('scenario', scenario);
            return mockingPo.mock(name).scenario.sendKeys(scenario);
        });

        world.When(/^I reset the scenario's to defaults$/, () => mockingPo.resetsToDefaults.click());

        world.When(/^I reset the scenario's to passThroughs$/, () => mockingPo.setToPassThroughs.click());

        world.When(/^I add variable (.*) with value (.*)$/, (name, value) => mockingPo.addVariable(name, value));

        world.When(/^I update variable (.*) with value (.*)$/, (name, value) => mockingPo.updateVariable(name, value));

        world.When(/^I delete variable (.*)$/, (name) => mockingPo.deleteVariable(name));

        world.When(/^I (enable|disable) echo for mock with name (.*)/, (able, name) =>
            mockingPo.mock(name).echo.click());

        world.Then(/^echoing should be (enabled|disabled) for mock with name (.*)/, (able, name) => {
            // no idea how I can check the server log for now check manually
        });

        world.When(/^I enable recording$/, () =>
            mockingPo.record.click());

        world.When(/^I (show|hide) the recordings for mock with name (.*)$/, (toggle, name) =>
            mockingPo.mock(name).recordings[toggle].click());

        world.Then(/^there should only be (\d+) recordings present for mock with name (.*)/, (total, name) =>
            expect(mockingPo.mock(name + '-recordings').recordings.records.count())
                .to.eventually.be.equal(parseInt(total)));

        world.Then(/^there should be no recordings present for mock with name (.*)/, (name) =>
            expect(mockingPo.mock(name + '-recordings').isPresent()).to.eventually.be.false);

        world.Then(/^I delay the response for mock with name (.*) for (\d+) milliseconds$/, (name, delay) =>
            mockingPo.mock(name).delay.clear().sendKeys(parseInt(delay))
                .then(() => browser.sleep(1000)
                    .then(() => browser.ignoreSynchronization = true))); // debounce delay
    }

    module.exports = InterfaceSteps;
})();