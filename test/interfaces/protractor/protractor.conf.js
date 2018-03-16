const path = require('path');

exports.config = {
    allScriptsTimeout: 5000,
    baseUrl: 'http://localhost:9900/',
    params: {
        default_directory: '/tmp'
    },
    specs: [
        '../../*.feature'
    ],
    onPrepare: async () => {
        const chai = require('chai');
        chai.use(require('chai-as-promised'));
        global.chai = chai;
        global.expect = chai.expect;
        await browser.getProcessedConfig().then(async (config) => {
            global.client = await require(path.join(process.cwd(), 'dist','interfaces','interfaces')).protractor;
            await browser.driver.manage().window().maximize();
        });
    },
    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    cucumberOpts: {
        require: '../step_definitions/*.steps.js',
        format: 'summary'
    }
};