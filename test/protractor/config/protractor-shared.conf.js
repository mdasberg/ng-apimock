var child_process = require('child_process'),
    chai = require('chai'),
    q = require('q'),
    server = child_process.spawn('node', ['test/example/server.js']);

chai.use(require('chai-as-promised'));

exports.config = {
    allScriptsTimeout: 11000,

    baseUrl: 'http://localhost:9900/',

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),

    onCleanUp: function () {
        // nothing to do here
    },
    onComplete: function () {
        // nothing to do here
    },
    beforeLaunch: function () {
        // nothing to do here
    },
    afterLaunch: function () {
        // nothing to do here
    },
    cucumberOpts: {
        require: [
            process.cwd() + '/test/protractor/step_definitions/*.steps.js',
            process.cwd() + '/test/protractor/support/*.js',
            process.cwd() + '/test/protractor/config/protractor-cucumber-junit-reporter.js',
        ],
        format: 'summary'
    }
};

process.on('exit', function () {
    server.kill();
});