const fs = require('fs-extra');
const junit = require('cucumberjs-junitxml');
const path = require('path');
const shortid = require('shortid');

const testResult = [];

function ReporterHooks() {
    const FAILED = 'failed';
    const reporter = this;

    reporter.registerHandler('BeforeFeature', beforeFeature);
    reporter.registerHandler('BeforeScenario', beforeScenario);
    reporter.registerHandler('StepResult', stepResult);
    reporter.registerHandler('AfterFeatures', afterFeatures);

    // save feature output
    function beforeFeature(feature, callback) {
        const currentFeatureId = feature.getName().replace(/ /g, '-');
        const featureOutput = {
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
    }

    // save scenario output
    function beforeScenario(scenario, callback) {
        const currentScenarioId = testResult[testResult.length - 1].id + ';' + scenario.getName().replace(/ /g, '-');
        const scenarioOutput = {
            id: currentScenarioId,
            name: scenario.getName(),
            description: scenario.getDescription(),
            line: scenario.getLine(),
            keyword: scenario.getKeyword(),
            steps: []
        };

        testResult[testResult.length - 1].elements.push(scenarioOutput);
        callback();
    }


    // save steps output
    function stepResult(stepResult, callback) {
        const step = stepResult.getStep();
        const keyword = step.getKeyword();

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
    }

    // output testResult
    function afterFeatures(payload, callback) {
        // We might not run all tests. only try to write results if we now they are there!
        if (testResult.length > 0) {
            browser.getCapabilities().then(function (capability) {
                const browserName = capability.get('browserName');
                const xml = junit(JSON.stringify(testResult), {indent: '    '});
                const outputFileName = 'results-' + shortid.generate() + '-' + testResult[testResult.length - 1].fileName + '.xml';
                const destination = path.join(path.join(browser.params.resultsDir, browserName), outputFileName);

                fs.ensureFileSync(destination);
                const file = fs.openSync(destination, 'w+');
                fs.writeSync(file, xml);
                callback();
            });
        } else {
            callback();
        }

    }
}

module.exports = ReporterHooks;