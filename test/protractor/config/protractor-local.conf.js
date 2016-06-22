var config = require('./protractor-shared.conf').config;

config.seleniumAddress = 'http://localhost:4444/wd/hub';

config.specs = [
    '../**/*.spec.js'
];

config.multiCapabilities = [
    {'browserName': 'chrome'}
];

exports.config = config;