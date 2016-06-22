var server = require('child_process').exec('node test/example/server.js' , function(err, stdout,stderr){});

exports.config = {
    allScriptsTimeout: 11000,

    baseUrl: 'http://localhost:9900/',

    framework: 'jasmine2',

    params: {
        environment: 'BUILD'
    },

    onPrepare: function () {
    },
    onCleanUp: function () {
        server.kill();
    },
    beforeLaunch: function () {

    },
    afterLaunch: function () {
    },
    jasmineNodeOpts: {
        isVerbose: true,
        showColors: true,
        includeStackTrace: false,
        defaultTimeoutInterval: 40000
    }
};