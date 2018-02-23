const config = require('../protractor.conf').config;
let server;

config.params = {
    environment: 'TRAVIS',
    default_directory: '/tmp'
};
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

config.beforeLaunch = () => {
    const child_process = require('child_process');
    const path = require('path');
    server = child_process.spawn('node',
        [path.join(process.cwd(), 'test/apps/angular/serve.js')],
        {cwd: process.cwd(), stdio: 'inherit'});
    process.on('exit', () => server.kill());

};
config.afterLaunch = () => {
    server.kill();
};

exports.config = config;
