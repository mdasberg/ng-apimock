const config = require('./wdio.conf').config;

config.params = {
    environment: 'TRAVIS',
    default_directory: '/tmp'
};

config.services = ['sauce'];
config.user = process.env.SAUCE_USERNAME;
config.key = process.env.SAUCE_ACCESS_KEY;

config.capabilities = [{
    browserName: 'chrome',
    name: 'ngApimock - webdriverio',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    build: process.env.TRAVIS_BUILD_NUMBER,
    chromeOptions: {
        args: ['--no-sandbox', '--test-type=browser'],
        prefs: {
            'download': {
                'prompt_for_download': false,
                'directory_upgrade': true,
                'default_directory': '/tmp'
            }
        }
    }
}];

exports.config = config;
