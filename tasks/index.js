(function () {
    'use strict';

    module.exports = function () {
        var glob = require('glob'),
            async = require('async'),
            _ = require('lodash'),
            utils = require('../lib/utils.js'),
            processor = require('./processor.js')(),
            defaultOutputDir = '.tmp/mocks/';

        return {
            run: function (configuration) {
                if (configuration === undefined) {
                    console.error('No configuration has been specified.');
                    throw new Error('No configuration has been specified.');
                }
                
                if (configuration.src === undefined) {
                    console.error('No mock source directory have been specified.');
                    throw new Error('No mock source directory have been specified.');
                }
                
                if(configuration.done === undefined) {
                    configuration.done = function() {}
                }

                var mocks,
                    outputDir = configuration.outputDir !== undefined ? configuration.outputDir : defaultOutputDir;

                async.series({
                        processMocks: function (callback) {
                            console.info('Process all the mocks');
                            mocks = processor.processMocks(configuration.src);
                            callback(null, 200);
                        },
                        registerMocks: function (callback) {
                            console.info('Register mocks');
                            utils.registerMocks(mocks);
                            callback(null, 200);
                        },
                        generateMockingInterface: function (callback) {
                            console.info('Generate the mocking web interface');
                            processor.generateMockingInterface(outputDir);
                            callback(null, 200);
                        },
                        generateProtractorMock: function (callback) {
                            console.info('Generate protractor.mock.js');
                            processor.generateProtractorMock(outputDir);
                            callback(null, 200);
                        }
                    },
                    function (err) {
                        if (err !== undefined && err !== null) {
                            console.error(err);
                        }
                        configuration.done();
                    });
            }
        };
    };
})();