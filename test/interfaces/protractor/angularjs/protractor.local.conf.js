const config = require('../protractor.conf').config;
let server;

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

config.beforeLaunch = () => {
    const child_process = require('child_process');
    const path = require('path');
    server = child_process.spawn('node',
        [path.join(process.cwd(), 'test/apps/angularjs/serve.js')],
        {cwd: process.cwd(), stdio: 'inherit'});
    process.on('exit', () => server.kill());

};
config.afterLaunch = () => {
    server.kill();
};

exports.config = config;
