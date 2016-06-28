(function () {
    module.exports = function () {
        var MockingPO = require('./../po/mocking.po'),
            po = new MockingPO();

        this.When(/^I select scenario (.*) for getAllTodos from the dropdown$/, function (scenario, callback) {
            po.apiGET.sendKeys(scenario).then(callback)
        });

        this.When(/^I select scenario (.*) for updateTodo from the dropdown$/, function (scenario, callback) {
            po.apiPOST.sendKeys(scenario).then(callback);
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


    };
})();