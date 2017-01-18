var config = require('./protractor-shared.conf').config;
var chai = require('chai');

config.seleniumAddress = 'http://localhost:4444/wd/hub';

config.params = {
    environment: 'LOCAL',
    default_directory: '/tmp/'
};

config.specs = [
    '../**/protractor/*.feature'
];

config.multiCapabilities = [
    {
        browserName: 'chrome',
        shardTestFiles: true,
        maxInstances: 10,
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
    }
];

config.onPrepare = function () {
    global.ngApimock = require('../../../.tmp/some-other-dir/protractor.mock.js');
    global.chai = chai;
    global.expect = chai.expect;
};

config.cucumberOpts = {
    require: [
        process.cwd() + '/test/protractor/step_definitions/testPage.steps.js',
        process.cwd() + '/test/protractor/step_definitions/protractor.steps.js',
        process.cwd() + '/test/protractor/support/*.js',
        process.cwd() + '/test/protractor/config/protractor-cucumber-junit-reporter.js',
    ],
    format: 'summary'
};
exports.config = config;