(function () {
    module.exports = function () {
        var MockingPO = require('./../po/mocking.po'),
            po = new MockingPO();

        this.Then(/^expression with name (.*) should have scenario (.*) selected as default$/, function (name, scenario, callback) {
            expect(po[name].all(by.css('option[selected="selected"]')).first().getText()).to.eventually.equal(scenario).and.notify(callback);
        });

        this.When(/^I select scenario (.*) for getAllTodos from the dropdown$/, function (scenario, callback) {
            po.getAllTodos.sendKeys(scenario).then(callback)
        });

        this.When(/^I select scenario (.*) for updateTodo from the dropdown$/, function (scenario, callback) {
            po.updateTodo.sendKeys(scenario).then(callback);
        });

        this.When(/^I switch back to the test page$/, function (callback) {
            browser.get('/index.html').then(callback);
        });

        this.When(/^I click reset to defaults$/, function (callback) {
            po.defaults().then(callback);
        });

        this.When(/^I click All to passThrough$/, function (callback) {
            po.passThrough().then(callback);
        });

        this.When(/^I create the global variable (.*) with (.*)$/, function (name, value, callback) {
            po.addVariable(name, value).then(callback);
        });

        this.When(/^I update the global variable (.*) with (.*)$/, function (name, value, callback) {
            po.updateVariable(name, value).then(callback);
        });

        this.When(/^I click delete the global variable (.*)$/, function (name, callback) {
            po.deleteVariable(name).then(callback);
        });

        this.When(/^I click echo$/, function (callback) {
            po.echoPOST.click().then(callback);
        });

        this.Then(/^it should enable echoing$/, function (callback) {
            // no idea how I can check the server log for now check manually
            callback();
        });

        this.Then(/^it should disable echoing$/, function (callback) {
            // no idea how I can check the server log for now check manually
            callback();
        });

        this.When(/^I click record$/, function (callback) {
            po.record.click().then(callback);
        });

        this.When(/^I show the recordings$/, function (callback) {
            po.showRecordings(1).then(function () {
                callback();
            });
        });

        this.Then(/^there should be recordings present$/, function (callback) {
            expect(po.recordings(1).count()).to.eventually.be.equal(2).and.notify(callback);
        });

        this.When(/^I hide the recordings$/, function (callback) {
            po.hideRecordings(1).then(function () {
                callback();
            });
        });

        this.Then(/^there should be no recordings present$/, function (callback) {
            expect(po.recordings(1).count()).to.eventually.be.equal(0).and.notify(callback);
        });
    };
})();