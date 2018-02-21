const child_process = require('child_process');
const uuid = require('uuid').v4();

const server = child_process.spawn('node',
    ['test/interfaces/protractor/angularjs/serve.js'],
    {cwd: process.cwd(), stdio: 'inherit'});

const chai = require('chai');
chai.use(require('chai-as-promised'));

exports.config = {
    allScriptsTimeout: 5000,
    baseUrl: 'http://localhost:9900/',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    params: {
        default_directory: `/tmp/${uuid}`
    },
    specs: [
        '../*.feature'
    ],
    multiCapabilities: [
        {
            browserName: 'chrome',
            chromeOptions: {
                // Get rid of --ignore-certificate yellow warning
                args: ['--no-sandbox', '--test-type=browser'],
                // Set download path and avoid prompting for download even though
                // this is already the default on Chrome but for completeness
                prefs: {
                    'download': {
                        'prompt_for_download': false,
                        'directory_upgrade': true,
                        'default_directory': `/tmp/${uuid}`
                    }
                }
            }
        }
    ],
    onPrepare: () => {
        global.chai = chai;
        global.expect = chai.expect;
        browser.driver.get(this.config.baseUrl).then(() => browser.driver.manage().window().maximize());
    },
    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    cucumberOpts: {
        require: '../step_definitions/*.steps.js',
        format: 'summary'
    }
};

process.on('exit', () => server.kill());