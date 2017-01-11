"use strict";
const glob = require("glob");
const fs = require("fs-extra");
const path = require("path");
/** Registry represents a group of phases grouped under one name. */
class Processor {
    constructor() {
        /**
         * Processes all the mocks that are present in the given directory.
         * @param {string} directory The directory containing the mocks.
         * @returns {Mock[]} mocks The mocks.
         */
        this.processMocks = (directory) => {
            const mocks = [];
            glob.sync('**/*.json', { cwd: directory, root: '/' }).forEach(function (file) {
                mocks.push(fs.readJsonSync(path.join(directory, file)));
            });
            return mocks;
        };
        /**
         * Generates the protractor.mock.js file in the given output directory.
         * @param {string} directory The output directory
         */
        this.generateProtractorMock = (directory) => {
            fs.copySync(path.join(Processor.PTD, 'protractor.mock.js'), path.join(directory, 'protractor.mock.js'));
        };
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
        this.generateMockingInterface = (directory) => {
            /** Check if the plugin has a different version of angular as the application. */
            const nmd = !fs.existsSync(path.join(Processor.PNMD, 'angular')) ?
                path.join(process.cwd(), 'node_modules') :
                Processor.PNMD, angularJs = path.join(nmd, 'angular', 'angular.min.js'), angularResource = path.join(nmd, 'angular-resource', 'angular-resource.min.js');
            // copy the interface files
            glob.sync('**/*', { cwd: Processor.PTID, root: '/' }).forEach(function (file) {
                fs.copySync(path.join(Processor.PTID, file), path.join(directory, file));
            });
            fs.copySync(angularJs, path.join(directory, 'js', 'angular.min.js'));
            fs.copySync(angularResource, path.join(directory, 'js', 'angular-resource.min.js'));
        };
    }
}
// the current working directory for this plugin
Processor.PCWD = path.resolve(__dirname, '..');
// the node_modules directory for this plugin
Processor.PNMD = path.join(Processor.PCWD, 'node_modules');
// the templates directory for this plugin
Processor.PTD = path.join(Processor.PCWD, 'templates');
// the templates interface directory for this plugin
Processor.PTID = path.join(Processor.PTD, 'interface');
exports.Processor = Processor;
//# sourceMappingURL=processor.js.map