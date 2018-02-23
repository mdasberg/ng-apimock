(() => {
    const {Given, When, Then} = require('cucumber');
    const page = new (require('../pos/page.po'))();

    const fs = require('fs-extra');
    const path = require('path');

    const mocksDirectory = path.join(process.cwd(), 'test', 'mocks');
    const responses = {
        getItems: fs.readJsonSync(path.join(mocksDirectory, 'get-items.mock.json')).responses,
        postItem: fs.readJsonSync(path.join(mocksDirectory, 'post-item.mock.json')).responses
    };

    responses.getItems['passThrough'] = {status: 200, data: [{pass: 'through'}]};
    responses.postItem['passThrough'] = {status: 200, data: {pass: 'through'}};

    Given(/^I open the test page$/, async () => await page.open());

    When(/^I get the items$/, async () => await page.buttons.get.click());

    When(/^I download the binary file$/, async () => await page.buttons.binary.click());

    When(/^I get the items as jsonp$/, async () => await page.buttons.getAsJsonp.click());

    When(/^I enter (.*) and post the item$/, async (data) =>
        await page.input.clearElement().then(() =>
            page.input.setValue(data)).then(() =>
            page.buttons.post.click()));

    Then(/^the (.*) response is returned for get items$/, async (scenario) => {
        await Promise.all([
            page.data.getText().then(text => {
                if (responses.getItems[scenario].data !== undefined) {
                    expect(JSON.parse(text)).to.deep.equal(responses.getItems[scenario].data);
                }
            }),
            page.status.getText().then(text => expect(parseInt(text)).to.equal(responses.getItems[scenario].status))
        ]);
    });

    Then(/^the response is interpolated with variable (.*)$/, async (variable) =>
        await page.data.getText().then(text =>
            expect(text).to.contain(variable)));


    Then(/^the (.*) response is returned for post item$/, async (scenario) => {
        await Promise.all([
            page.data.getText().then(text => {
                if (responses.postItem[scenario].data !== undefined) {
                    expect(JSON.parse(text)).to.deep.equal(responses.postItem[scenario].data)
                }
            }),
            page.status.getText().then(text => expect(parseInt(text)).to.equal(responses.postItem[scenario].status))
        ]);
    });

    Then(/^the items are not yet fetched$/, async () => await
        expect(page.done.getText()).to.eventually.equal('false'));

    Then(/^the items are fetched$/, async () => {
        browser.ignoreSynchronization = false;
        await expect(page.done.getText()).to.eventually.equal('true');
    });

    Then(/^the (.*) response should be downloaded$/, async (scenario) =>
        await browser.pause(5000).then(() => {
            if (fs.existsSync(browser.options.default_directory + '/test.pdf')) {
                const actual = fs.readFileSync(browser.options.default_directory + '/test.pdf');
                const expected = fs.readFileSync(responses.getItems[scenario].file);
                return actual.equals(expected);
            } else {
                return browser.options.environment === 'TRAVIS'
            }
        }));
})();
