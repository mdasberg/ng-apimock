var fs = require('fs-extra');
var junit = require('cucumberjs-junitxml');
var path = require('path');
var shortid = require('shortid');

var testResult = [];

var reporterHooks = function () {
    var FAILED = 'failed';

    // save feature output
    this.registerHandler('BeforeFeature', function (feature, callback) {
        var currentFeatureId = feature.getName().replace(/ /g, '-');

        var featureOutput = {
            id: currentFeatureId,
            fileName: path.basename(feature.getUri()),
            filePath: path.relative(path.resolve(browser.params.testDir), path.basename(feature.getUri())),
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
    this.registerHandler('BeforeScenario', function (scenario, callback) {
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
    this.registerHandler('StepResult', function (stepResult, callback) {
        var step = stepResult.getStep();
        var keyword = step.getKeyword();

        if (keyword.trim() !== 'After' && keyword.trim() !== 'Before') { // Do not log Before and After
            const stepResultOutput = {
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


            if (stepResultOutput.result.status === undefined || stepResultOutput.result.status === FAILED) {
                stepResultOutput.result.status = FAILED;
                const failureMessage = stepResult.getFailureException();
                if (failureMessage) {
                    stepResultOutput.result.error_message = (failureMessage.stack || failureMessage);
                }
                stepResultOutput.result.duration = stepResult.getDuration();
            }

            const rlen = testResult.length - 1;
            testResult[rlen].elements[testResult[rlen].elements.length - 1].steps.push(stepResultOutput);
        }
        callback();
    });

    // output testResult
    this.registerHandler('AfterFeatures', function (payload, callback) {
        // We might not run all tests. only try to write results if we now they are there!
        if (testResult.length > 0) {
            browser.getCapabilities().then(function (capability) {
                var browserName = capability.get('browserName');
                var xml = junit(JSON.stringify(testResult), {indent: '    '});
                var outputFileName = 'results-' + shortid.generate() + '-' + testResult[testResult.length - 1].fileName + '.xml';
                var destination = path.join(path.join(browser.params.resultsDir, browserName), outputFileName);

                fs.ensureFileSync(destination);
                var file = fs.openSync(destination, 'w+');
                fs.writeSync(file, xml);
                callback();
            });
        } else {
            callback();
        }

    });
};

module.exports = reporterHooks;