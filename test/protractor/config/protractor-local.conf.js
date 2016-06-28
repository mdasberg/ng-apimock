var config = require('./protractor-shared.conf').config;

config.seleniumAddress = 'http://localhost:4444/wd/hub';

config.multiCapabilities = [
    {
        browserName: 'chrome',
        shardTestFiles: true,
        maxInstances: 10
    }
];

exports.config = config;