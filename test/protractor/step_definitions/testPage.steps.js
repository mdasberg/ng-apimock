(function () {
    'use strict';

    module.exports = function () {
        var fs = require('fs-extra'),
            path = require('path'),
            TestPO = require('./../po/test.po'),
            responses = {
                list: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-list.json')).responses,
                update: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-post.json')).responses,
                download: fs.readJsonSync(path.join(process.cwd(), 'test', 'mocks', 'api', 'some-api-download.json')).responses
            },
            passThroughResponses = {
                list: [{a: "b"}],
                update: {c: "d"}
            },
            testPo = new TestPO();

        this.When(/^I open the test page$/, function () {
            return browser.get('/index.html');
        });

        this.Then(/^I switch to mocking interface$/, function () {
            return testPo.switch.click().then(function () {
                browser.getAllWindowHandles().then(function (handles) {
                    browser.driver.switchTo().window(handles[1]);
                });
            });
        });

        this.Then(/^the (?!passThrough)(.*) response should be returned for mock with name (.*)$/, function (scenario, name) {
            return expect(testPo[name].data.getText()).to.eventually.equal(JSON.stringify(responses[name][scenario].data));
        });

        this.Then(/^the (?!passThrough)(.*) response should be returned with interpolated value (.*) for key (.*) for mock with name (.*)$/, function (scenario, interpolatedValue, interpolatedKey, name) {
            return testPo[name].data.getText().then(function (text) {
                expect(text.indexOf('%%' + interpolatedKey + '%%')).to.equal(-1);
                return expect(text.indexOf(interpolatedValue)).to.be.above(-1);
            });
        });

        this.Then(/^the passThrough response should be returned for mock with name (.*)$/, function (name) {
            return expect(testPo[name].data.getText()).to.eventually.equal(JSON.stringify(passThroughResponses[name]));
        });

        this.Then(/^the (.*) response should be downloaded for mock with name (.*)$/, function (scenario, name) {
            return browser.wait(function () {
                if (fs.existsSync(browser.params.default_directory + 'my.pdf')) {
                    var actual = fs.readFileSync(browser.params.default_directory + 'my.pdf'),
                        expected = fs.readFileSync(responses[name][scenario].file);
                    return actual.equals(expected);
                } else {
                    return browser.params.environment === 'TRAVIS'
                }
            }, 5000);
        });

        this.Then(/^the status code should be (.*) for mock with name (.*)$/, function (statusCode, name) {
            return expect(testPo[name].error.getText()).to.eventually.equal(statusCode === 'undefined' ? '' : statusCode);
        });

        this.When(/^I post data$/, function () {
            return testPo.update.button.click();
        });

        this.When(/^I download the pdf$/, function () {
            fs.removeSync(browser.params.default_directory + 'my.pdf');
            return testPo.download.button.click();
        });

        this.When(/^I refresh$/, function () {
            return testPo.list.refresh.click();
        });

        this.When(/^I refresh using jsonp$/, function () {
            return testPo.list.refreshJsonp.click();
        });

        this.Then(/^the loading warning is visible$/, function () {
            return expect(testPo.list.loading.getText()).to.eventually.equal('loading');
        });

        this.When(/^I wait a (\d+) milliseconds$/, function (wait) {
            return browser.sleep(wait);
        });

        this.Then(/^the loading message is visible$/, function () {
            browser.ignoreSynchronization = false;
            return expect(testPo.list.loading.getText()).to.eventually.equal('finished');
        });
    };
})();