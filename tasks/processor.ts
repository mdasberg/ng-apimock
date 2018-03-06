import * as glob from 'glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import Mock from './mock';
import Preset from "./preset";

/** Registry represents a group of phases grouped under one name. */
class Processor {
    // the current working directory for this plugin
    static PCWD: string = path.resolve(__dirname, '..');
    // the node_modules directory for this plugin
    static PNMD: string = path.join(Processor.PCWD, 'node_modules');
    // the templates directory for this plugin
    static PTD: string = path.join(Processor.PCWD, 'templates');
    // the templates interface directory for this plugin
    static PTID = path.join(Processor.PTD, 'interface');

    /**
     * Processes all the mocks that are present in the given directory.
     * @param {string} directory The directory containing the mocks.
     * @returns {Mock[]} mocks The mocks.
     */
    processMocks(directory: string): Mock[] {
        const mocks: Mock[] = [];
        glob.sync('**/*.json', {
            cwd: directory,
            root: '/',
            ignore: 'presets/*.json'
        }).forEach((file) =>
            mocks.push(fs.readJsonSync(path.join(directory, file))));
        return mocks;
    }

    processPresets(directory: string): Preset[] {
        const presetDir = path.join(directory, 'presets');

        return glob.sync('*.json', {
            cwd: presetDir,
            root: '/'
        }).map((file) => {
            return fs.readJsonSync(path.join(presetDir, file));
        });
    }

    /**
     * Generates the protractor.mock.js file in the given output directory.
     * @param {string} directory The output directory
     */
    generateProtractorMock(directory: string): void {
        fs.copySync(path.join(Processor.PTD, 'protractor.mock.js'), path.join(directory, 'protractor.mock.js'));
    }

    /**
     * Generate the mocking interface.
     * There can be an angular version difference between the application and ng-apimock.
     * Therefor ng-apimock should always use its own version.
     *
     * @param {string} directory The output directory.
     *
     * #1 copy the interface to the output directory
     * #2 copy the dependencies to the output directory
     */
    generateMockingInterface(directory: string): void {
        /** Check if the plugin has a different version of angular as the application. */
        const anmd = !fs.existsSync(path.join(Processor.PNMD, 'angular')) ?
                path.join(process.cwd(), 'node_modules') :
                Processor.PNMD,
            arnmd = !fs.existsSync(path.join(Processor.PNMD, 'angular-resource')) ?
                path.join(process.cwd(), 'node_modules') :
                Processor.PNMD,
            angularJs = path.join(anmd, 'angular', 'angular.min.js'),
            angularResource = path.join(arnmd, 'angular-resource', 'angular-resource.min.js');

        // copy the interface files
        glob.sync('**/*', { cwd: Processor.PTID, root: '/' }).forEach((file) =>
            fs.copySync(path.join(Processor.PTID, file), path.join(directory, file)));

        fs.copySync(angularJs, path.join(directory, 'js', 'angular.min.js'));
        fs.copySync(angularResource, path.join(directory, 'js', 'angular-resource.min.js'));
    }
}

export default Processor;
