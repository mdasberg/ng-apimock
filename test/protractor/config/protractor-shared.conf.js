var child_process = require('child_process'),
    server = child_process.spawn('node', ['test/example/server.js']);

server.stdout.pipe(process.stdout);

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
    }
};

process.on('exit', function () {
    server.kill();
});