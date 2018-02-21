const config = require('../protractor.conf').config;
const child_process = require('child_process');
const server = child_process.spawn('node',
    ['test/interfaces/protractor/angular/serve.js'],
    {cwd: process.cwd(), stdio: 'inherit'});

process.on('exit', () => server.kill());

config.sauceUser = process.env.SAUCE_USERNAME;
config.sauceKey = process.env.SAUCE_ACCESS_KEY;

config.multiCapabilities = [{
    browserName: 'chrome',
    name: 'ngApimock - protractor',
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