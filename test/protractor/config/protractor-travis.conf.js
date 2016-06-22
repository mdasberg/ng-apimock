var config = require('./protractor-shared.conf').config;

config.sauceUser = process.env.SAUCE_USERNAME;
config.sauceKey = process.env.SAUCE_ACCESS_KEY;

config.specs = [
    '../**/*.spec.js'
];

config.multiCapabilities = [{
    'browserName': 'chrome',
    'name': 'ngApimock - protractor',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'shardTestFiles': true,
    'maxInstances': 10
}];


exports.config = config;