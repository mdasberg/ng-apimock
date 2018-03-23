import * as async from 'async';
import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import Mock from './mock';
import Configuration from './configuration';
import Processor from './processor';
import Preset from "./preset";

(module).exports = function () {
    'use strict';

    const processor = new Processor();
    const defaults = {
        destination: '.tmp/mocks/'
    };
    const utils = require('../lib/utils');

    return {
        run: run,
        watch: watch
    };

    /**
     * Run ngapimock.
     * @param configuration The configuration.
     */
    function run(configuration: Configuration) {
        if (configuration === undefined) {
            console.error('No configuration has been specified.');
            throw new Error('No configuration has been specified.');
        }

        if (configuration.src === undefined) {
            console.error('No mock source directory have been specified.');
            throw new Error('No mock source directory have been specified.');
        }

        const config = {
            baseUrl: configuration.baseUrl,
            source: configuration.src,
            done: configuration.done !== undefined ? configuration.done : () => {
            },
            destination: configuration.outputDir !== undefined ? configuration.outputDir : defaults.destination
        };

        let mocks: Mock[];
        let presets: Preset[];

        async.series({
                processMocks: (callback: Function) => {
                    console.info('Process all the mocks');
                    mocks = processor.processMocks(config.source);
                    callback(null, 'processed mocks');
                },
                registerMocks: (callback: Function) => {
                    console.info('Register mocks');
                    utils.registerMocks(mocks);
                    callback(null, 'registered mocks');
                },
                processPresets: (callback: Function) => {
                    console.info('Process all the presets');
                    presets = processor.processPresets(config.source);
                    callback(null, 'processed presets');
                },
                registerPresets: (callback: Function) => {
                    console.info('Register presets');
                    utils.registerPresets(presets);
                    callback(null, 'registered presets');
                },
                generateMockingInterface: (callback: Function) => {
                    console.info('Generate the mocking web interface');
                    processor.generateMockingInterface(config.destination);
                    callback(null, 'generated mocking interface');
                },
                generateProtractorMock: (callback: Function) => {
                    console.info('Generate protractor.mock.js');
                    processor.generateProtractorMock(config.destination, config.baseUrl);
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

    /**
     * Watch to file changes.
     * @param directory The directory to watch
     */
    function watch(directory: String) {
        console.info('Watching', directory, 'for changes');
        const watcher = chokidar.watch(directory + '/**/*.json', {
            ignored: /[\/\\]\./,
            persistent: true
        });
        watcher
            .on('add', path => _processMock(path))
            .on('change', path => _processMock(path))
            .on('unlink', path => _processMock(path));
    }

    /**
     * Processes all the mocks that are present in the given directory.
     * @param {string} directory The directory containing the mocks.
     * @returns {Mock[]} mocks The mocks.
     */
    function _processMock(file: string): void {
        try {
            const mock: Mock = fs.readJsonSync(file);
            utils.updateMock(mock);
        } catch (ex) {
            console.info(file, 'contains invalid json');
        }
    }
};
