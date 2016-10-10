(function () {
    'use strict';

    module.exports = function () {
        var glob = require("glob"),
            fs = require('fs-extra'),
            path = require('path'),
            ngApimockCwd = path.resolve(__dirname, '..'),
            ANGULAR_JS_PATH_SUFFIX = path.sep + 'angular' + path.sep + 'angular.min.js',
            ANGULAR_RESOURCE_PATH_SUFFIX = path.sep + 'angular-resource' + path.sep + 'angular-resource.min.js';

        /**
         * Process all the mocks.
         * @param {string} src The directory containing the mocks.
         *
         * #1 iterate over each json file
         * #2 add the content to the mocks collection
         */
        function processMocks(src) {
            var mocks = [];
            // #1
            glob.sync('**/*.json', {cwd: src, root: '/'}).forEach(function (file) {
                // #2
                mocks.push(fs.readJsonSync(src + path.sep + file, {throws: true}));
            });
            return mocks;
        }

        /**
         * Generate the mocking interface by processing all mocks.
         * @param {string} outputDir The output directory.
         *
         * #1 copy the interface to the output directory
         * #2 copy the dependencies to the output directory
         */
        function generateMockingInterface(outputDir) {
            var templateDir = path.join(ngApimockCwd, '/templates/interface'),
                nodeModulesDir = path.join(ngApimockCwd, '/node_modules');

            if (!fs.existsSync(fs.existsSync(nodeModulesDir + '/angular'))) {
                nodeModulesDir = path.join(process.cwd(), '/node_modules');
            }
            // #1

            glob.sync('**/*', {cwd: templateDir, root: '/'}).forEach(function (file) {
                fs.copySync(templateDir + path.sep + file, outputDir + path.sep + file);
            });

            var angularJs = nodeModulesDir + ANGULAR_JS_PATH_SUFFIX,
                angularResource = nodeModulesDir + ANGULAR_RESOURCE_PATH_SUFFIX;

            if(!fs.existsSync(angularJs)) {
                angularJs = path.join(process.cwd(), '/node_modules') + ANGULAR_JS_PATH_SUFFIX;
            }

            if(!fs.existsSync(angularResource)) {
                angularResource = path.join(process.cwd(), '/node_modules') + ANGULAR_RESOURCE_PATH_SUFFIX;
            }

            fs.copySync(angularJs, outputDir + path.sep + 'js' + path.sep + 'angular.min.js');
            fs.copySync(angularResource, outputDir + path.sep + 'js' + path.sep + 'angular-resource.min.js');
        }

        /**
         * Copy the protractor.mock.js file to the output dir.
         * @param {string} outputDir The output directory.
         *
         * #1 update the template with the module name
         * #2 write the template to file
         */
        function generateProtractorMock(outputDir) {
            fs.copySync(ngApimockCwd + '/templates/protractor.mock.js', outputDir + path.sep + 'protractor.mock.js');
        }

        return {
            processMocks: processMocks,
            generateMockingInterface: generateMockingInterface,
            generateProtractorMock: generateProtractorMock
        };
    };
})();