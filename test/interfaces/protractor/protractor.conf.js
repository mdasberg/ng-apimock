exports.config = {
    allScriptsTimeout: 5000,
    baseUrl: 'http://localhost:9900/',
    params: {
        default_directory: '/tmp'
    },
    specs: [
        '../*.feature'
    ],
    onPrepare: () => {
        const chai = require('chai');
        chai.use(require('chai-as-promised'));
        global.chai = chai;
        global.expect = chai.expect;
        browser.driver.get(this.config.baseUrl).then(() => // take care of setting the cookie
            browser.driver.manage().window().maximize());
    },
    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    cucumberOpts: {
        require: '../step_definitions/*.steps.js',
        format: 'summary'
    }
};