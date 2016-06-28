var fs = require('fs-extra'),
    junit = require('cucumberjs-junitxml'),
    path = require('path');

var testResult = [];

var reporterHooks = function () {
    // save feature output
    this.registerHandler('BeforeFeature', function (event, callback) {
        var feature = event.getPayloadItem('feature');
        var currentFeatureId = feature.getName().replace(/ /g, '-');
        var featureOutput = {
            id: currentFeatureId,
            fileName: path.basename(feature.getUri()),
            filePath: path.relative(path.resolve('test'), path.basename(feature.getUri())),
            name: feature.getName(),
            description: feature.getDescription(),
            line: feature.getLine(),
            keyword: feature.getKeyword(),
            uri: feature.getUri(),
            elements: []
        };

        testResult.push(featureOutput);
        callback();
    });

    // save scenario output
    this.registerHandler('BeforeScenario', function (event, callback) {

        var scenario = event.getPayloadItem('scenario');
        var currentScenarioId = testResult[testResult.length - 1].id + ';' + scenario.getName().replace(/ /g, '-');
        var scenarioOutput = {
            id: currentScenarioId,
            name: scenario.getName(),
            description: scenario.getDescription(),
            line: scenario.getLine(),
            keyword: scenario.getKeyword(),
            steps: []
        };

        testResult[testResult.length - 1].elements.push(scenarioOutput);
        callback();
    });

    // save steps output
    this.registerHandler('StepResult', function (event, callback) {
        var stepResult = event.getPayloadItem('stepResult');
        var step = stepResult.getStep();

        var keyword = step.getKeyword();
        if(keyword.trim() !== 'After' && keyword.trim() !== 'Before') { // Do not log Before and After
            var stepOutput = {
                name: step.getName(),
                line: step.getLine(),
                keyword: keyword,
                result: {
                    status: stepResult.getStatus(),
                    duration: stepResult.getDuration(),
                    error_message: undefined
                },
                match: {}
            };

            if (stepOutput.result.status === undefined) {
                stepOutput.result.status = 'failed';
                var failureMessage = stepResult.getFailureException();
                if (failureMessage) {
                    stepOutput.result.error_message = (failureMessage.stack || failureMessage);
                }
                stepOutput.result.duration = stepResult.getDuration();
            }

            var rlen = testResult.length - 1;
            testResult[rlen].elements[testResult[rlen].elements.length - 1].steps.push(stepOutput);
        }

        callback();
    });

    // output testResult
    this.registerHandler('AfterFeatures', function (event, callback) {
        browser.getCapabilities().then(function (cap) {
            var browserName = cap.get('browserName');
            var xml = junit(JSON.stringify(testResult), {indent: '    '});

            var destination = 'results' + '/' + browserName + '/results-' + testResult[testResult.length - 1].fileName + '.xml';
            console.log('after features', browserName, destination)
            fs.ensureFileSync(destination);
            var file = fs.openSync(destination, 'w+');
            fs.writeSync(file, xml);
            callback();
        });

    });
};

module.exports = reporterHooks;