var config = require('./protractor-shared.conf').config;

config.seleniumAddress = 'http://localhost:4444/wd/hub';

config.params = {
    environment: 'BUILD',
    default_directory: '/tmp/'
};

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

exports.config = config;