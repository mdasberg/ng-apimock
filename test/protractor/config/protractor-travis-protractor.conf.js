const config = require('./protractor-shared.conf').config;
const chai = require('chai');
chai.use(require('chai-as-promised'));

config.sauceUser = process.env.SAUCE_USERNAME;
config.sauceKey = process.env.SAUCE_ACCESS_KEY;

config.params = {
    environment: 'TRAVIS',
    default_directory: '/tmp/',
    testDir: 'test',
    resultsDir: 'results'
};

config.specs = [
    '../**/protractor/*.feature'
];

config.multiCapabilities = [{
    'browserName': 'chrome',
    'name': 'ngApimock - protractor',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'shardTestFiles': true,
    'maxInstances': 10,
    chromeOptions: {
        // Get rid of --ignore-certificate yellow warning
        args: ['--no-sandbox', '--test-type=browser'],
        // Set download path and avoid prompting for download even though
        // this is already the default on Chrome but for completeness
        prefs: {
            'download': {
                'prompt_for_download': false,
                'default_directory': config.params.default_directory
            }
        }
    }
}];

config.onPrepare = () => {
    global.ngApimock = require('../../../.tmp/some-other-dir/protractor.mock.js');
    global.chai = chai;
    global.expect = chai.expect;
    browser.driver.manage().window().maximize();
};

config.cucumberOpts = {
    require: [
        process.cwd() + '/test/protractor/config/cucumber.default.js',
        process.cwd() + '/test/protractor/step_definitions/testPage.steps.js',
        process.cwd() + '/test/protractor/step_definitions/protractor.steps.js',
        process.cwd() + '/test/protractor/support/*.js',
        process.cwd() + '/test/protractor/config/protractor-cucumber-junit-reporter.js',
    ],
    format: 'summary'
};

exports.config = config;