(function () {
    module.exports = function () {
        var fs = require('fs-extra'),
            path = require('path'),
            MockingPO = require('./../po/mocking.po'),
            responses = {
                list: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-list.json')).responses,
                update: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-post.json')).responses,
                download: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-download.json')).responses
            },
            mockingPo = new MockingPO();


        this.Then(/^I switch to test page$/, function () {
            browser.getAllWindowHandles().then(function (handles) {
                browser.driver.switchTo().window(handles[1]);
                browser.driver.close();
                browser.driver.switchTo().window(handles[0]);
            });
        });

        this.Given(/^a mock with name (.*) has marked (.*) as its default scenario$/, function (name, scenario) {
            return expect(responses[name][scenario]['default']).to.be.true;
        });

        this.Given(/^a mock with name (.*) has no scenario marked as default$/, function (name) {
            expect(Object.keys(responses[name]).filter(function (scenario) {
                return responses[name][scenario].default || false;
            }).length).to.equal(0);
        });

        this.Given(/^I open the mocking interface$/, function () {
            return browser.get('/mocking');
        });

        this.Then(/^the following scenario's should be selected:$/, function (table) {
            return protractor.promise.all(table.hashes().map(function (row) {
                var actual = mockingPo.mock(row.name).scenario.all(by.css('option[selected="selected"]')).first().getText(),
                    expected = row.scenario;
                return expect(actual).to.eventually.equal(expected);
            }));
        });

        this.When(/^I select (.*) for mock with name (.*)$/, function (scenario, name) {
            return mockingPo.mock(name).scenario.sendKeys(scenario);
        });

        this.When(/^I reset the scenario's to defaults$/, function () {
            return mockingPo.resetsToDefaults.click();
        });

        this.When(/^I reset the scenario's to passThroughs$/, function () {
            return mockingPo.setToPassThroughs.click();
        });

        this.When(/^I add variable (.*) with value (.*)$/, function (name, value) {
            return mockingPo.addVariable(name, value);
        });

        this.When(/^I update variable (.*) with value (.*)$/, function (name, value) {
            return mockingPo.updateVariable(name, value);
        });

        this.When(/^I delete variable (.*)$/, function (name) {
            return mockingPo.deleteVariable(name);
        });

        this.When(/^I (enable|disable) echo for mock with name (.*)/, function (able, name) {
            return mockingPo.mock(name).echo.click();
        });

        this.Then(/^echoing should be (enabled|disabled) for mock with name (.*)/, function (able, name) {
            // no idea how I can check the server log for now check manually
        });

        this.When(/^I enable recording$/, function () {
            return mockingPo.record.click();
        });

        this.When(/^I (show|hide) the recordings for mock with name (.*)$/, function (toggle, name) {
            return mockingPo.mock(name).recordings[toggle].click();
        });

        this.Then(/^there should only be (\d+) recordings present for mock with name (.*)/, function (total, name) {
            return expect(mockingPo.mock(name + '-recordings').recordings.records.count()).to.eventually.be.equal(parseInt(total));
        });

        this.Then(/^there should be no recordings present for mock with name (.*)/, function (name) {
            return expect(mockingPo.mock(name + '-recordings').isPresent()).to.eventually.be.false;
        });

        this.Then(/^I delay the response for mock with name (.*) for (\d+) milliseconds$/, function (name, delay) {
            return mockingPo.mock(name).delay.clear().sendKeys(parseInt(delay)).then(function () {
                return browser.sleep(1000).then(function () {
                    browser.ignoreSynchronization = true;
                }); // debounce delay
            });
        });
    };
})();