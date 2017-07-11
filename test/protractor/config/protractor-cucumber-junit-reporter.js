const fs = require('fs-extra');
const junit = require('cucumberjs-junitxml');
const path = require('path');
const shortid = require('shortid');
const {defineSupportCode} = require('cucumber');
const testResult = [];

defineSupportCode(function({registerHandler}) {
    const FAILED = 'failed';

    registerHandler('BeforeFeature', beforeFeature);
    registerHandler('BeforeScenario', beforeScenario);
    registerHandler('StepResult', stepResult);
    registerHandler('AfterFeatures', afterFeatures);

    // save feature output
    function beforeFeature(feature, callback) {
        const currentFeatureId = feature.name.replace(/ /g, '-');
        const featureOutput = {
            id: currentFeatureId,
            fileName: path.basename(feature.uri),
            filePath: path.relative(path.resolve(browser.params.testDir), path.basename(feature.uri)),
            name: feature.name,
            description: feature.description,
            line: feature.line,
            keyword: feature.keyword,
            uri: feature.uri,
            elements: []
        };

        testResult.push(featureOutput);
        callback();
    }

    // save scenario output
    function beforeScenario(scenario, callback) {
        const currentScenarioId = testResult[testResult.length - 1].id + ';' + scenario.name.replace(/ /g, '-');
        const scenarioOutput = {
            id: currentScenarioId,
            name: scenario.name,
            description: scenario.description,
            line: scenario.line,
            keyword: scenario.keyword,
            steps: []
        };

        testResult[testResult.length - 1].elements.push(scenarioOutput);
        callback();
    }


    // save steps output
    function stepResult(stepResult, callback) {
        const step = stepResult.step;
        const keyword = step.keyword;

        if (keyword.trim() !== 'After' && keyword.trim() !== 'Before') { // Do not log Before and After
            const stepResultOutput = {
                name: step.name,
                line: step.line,
                keyword: keyword,
                result: {
                    status: stepResult.status,
                    duration: stepResult.duration,
                    error_message: undefined
                },
                match: {}
            };

            if (stepResultOutput.result.status === undefined || stepResultOutput.result.status === FAILED) {
                stepResultOutput.result.status = FAILED;
                const failureMessage = stepResult.failureException;
                if (failureMessage) {
                    stepResultOutput.result.error_message = (failureMessage.stack || failureMessage);
                }
                stepResultOutput.result.duration = stepResult.duration;
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
});