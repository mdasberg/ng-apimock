import * as async from "async";
import {Processor} from "./processor";
import {Mock} from "./mock";
import {Configuration} from "./configuration";

'use strict';


(module).exports = function () {
    const processor = new Processor(),
        defaults = {
            destination: '.tmp/mocks/'
        },
        utils = require('../lib/utils.js');

    return {
        run: function (configuration: Configuration) {
            if (configuration === undefined) {
                console.error('No configuration has been specified.');
                throw new Error('No configuration has been specified.');
            }

            if (configuration.src === undefined) {
                console.error('No mock source directory have been specified.');
                throw new Error('No mock source directory have been specified.');
            }

            const config = {
                source: configuration.src,
                done: configuration.done !== undefined ? configuration.done : () => {
                    },
                destination: configuration.outputDir !== undefined ? configuration.outputDir : defaults.destination
            };

            let mocks: Mock[];

            async.series({
                    processMocks: (callback: Function) => {
                        console.info('Process all the mocks');
                        mocks = processor.processMocks(config.source);
                        callback(null, 'processed mocks');
                    },
                    registerMocks: function (callback) {
                        console.info('Register mocks');
                        utils.registerMocks(mocks);
                        callback(null, 'registered mocks');
                    },
                    generateMockingInterface: function (callback) {
                        console.info('Generate the mocking web interface');
                        processor.generateMockingInterface(config.destination);
                        callback(null, 'generated mocking interface');
                    },
                    generateProtractorMock: function (callback) {
                        console.info('Generate protractor.mock.js');
                        processor.generateProtractorMock(config.destination);
                        callback(null, 200);
                    }
                },
                function (err) {
                    if (err !== undefined && err !== null) {
                        console.error(err);
                    }
                    config.done();
                });
        }
    };
};