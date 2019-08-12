(() => {
    const {defineSupportCode} = require('cucumber');


    defineSupportCode(function ({When, Then}) {
        const fs = require('fs-extra');
        const path = require('path');
        const testPo = new (require('./../po/test.po'))();
        const mocksDirectory = path.join(process.cwd(), 'test', 'mocks', 'api');
        const responses = {
            list: fs.readJsonSync(path.join(mocksDirectory, 'some-api-list.json')).responses,
            update: fs.readJsonSync(path.join(mocksDirectory, 'some-api-update.json')).responses,
            insert: fs.readJsonSync(path.join(mocksDirectory, 'some-api-insert.json')).responses,
            download: fs.readJsonSync(path.join(mocksDirectory, 'some-api-download.json')).responses
        };
        const passThroughResponses = {
            list: [{a: "b"}],
            update: {c: "d"}
        };

        When(/^I open the test page$/, () => browser.get('/index.html'));

        Then(/^I switch to mocking interface$/, () =>
            testPo.switch.click()
                .then(() => browser.getAllWindowHandles()
                    .then((handles) => browser.driver.switchTo().window(handles[1]))));

        Then(/^the (?!passThrough)(.*) response should be returned for mock with name (.*)$/, (scenario, name) =>
            expect(testPo[name].data.getText()).to.eventually.equal(JSON.stringify(responses[name][scenario].data)));

        Then(/^the (?!passThrough)(.*) response should be returned with interpolated value (.*) for key (.*) for mock with name (.*)$/, (scenario, interpolatedValue, interpolatedKey, name) =>
            testPo[name].data.getText()
                .then((text) => {
                    expect(text.indexOf('%%' + interpolatedKey + '%%')).to.equal(-1);
                    expect(text.indexOf(interpolatedValue)).to.be.above(-1);
                }));

        Then(/^the passThrough response should be returned for mock with name (.*)$/, (name) =>
            expect(testPo[name].data.getText()).to.eventually.equal(JSON.stringify(passThroughResponses[name])));

        Then(/^the (.*) response should be downloaded for mock with name (.*)$/, (scenario, name) =>
            browser.wait(() => {
                if (fs.existsSync(browser.params.default_directory + 'my.pdf')) {
                    const actual = fs.readFileSync(browser.params.default_directory + 'my.pdf');
                    const expected = fs.readFileSync(responses[name][scenario].file);
                    return actual.equals(expected);
                } else {
                    return browser.params.environment === 'TRAVIS'
                }
            }, 5000));

        Then(/^the status code should be (.*) for mock with name (.*)$/, (statusCode, name) =>
            expect(testPo[name].error.getText()).to.eventually.equal(statusCode === 'undefined' ? '' : statusCode));

        When(/^I post data$/, () => testPo.update.button.click());

        When(/^I post some other data$/, () => testPo.insert.button.click());

        When(/^I download the pdf$/, () => {
            fs.removeSync(browser.params.default_directory + 'my.pdf');
            return testPo.download.button.click();
        });

        When(/^I refresh$/, () => testPo.list.refresh.click());

        When(/^I refresh using jsonp$/, () => testPo.list.refreshJsonp.click());

        Then(/^the loading warning is visible$/, () =>
            expect(testPo.list.loading.getText()).to.eventually.equal('loading'));

        When(/^I wait a (\d+) milliseconds$/, (wait) => browser.sleep(wait));

        Then(/^the loading message is visible$/, () => {
            browser.waitForAngularEnabled(true);
            return expect(testPo.list.loading.getText()).to.eventually.equal('finished');
        });
    });
})();
