var config = require('./protractor-shared.conf').config;
var chai = require('chai');

config.sauceUser = process.env.SAUCE_USERNAME;
config.sauceKey = process.env.SAUCE_ACCESS_KEY;

config.params = {
    environment: 'TRAVIS',
    default_directory: '/tmp/'
};

config.specs = [
    '../**/interface/*.feature'
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

config.onPrepare = function () {
    global.chai = chai;
    global.expect = chai.expect;
};

config.cucumberOpts = {
    require: [
        process.cwd() + '/test/protractor/step_definitions/testPage.steps.js',
        process.cwd() + '/test/protractor/step_definitions/interface.steps.js',
        process.cwd() + '/test/protractor/support/*.js',
        process.cwd() + '/test/protractor/config/protractor-cucumber-junit-reporter.js',
    ],
    format: 'summary'
};

exports.config = config;