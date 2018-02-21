const config = require('../protractor.conf').config;
const child_process = require('child_process');
const server = child_process.spawn('node',
    ['test/interfaces/protractor/angular/serve.js'],
    {cwd: process.cwd(), stdio: 'inherit'});

process.on('exit', () => server.kill());

config.multiCapabilities = [{
    browserName: 'chrome',
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

config.seleniumAddress = 'http://localhost:4444/wd/hub';

exports.config = config;

