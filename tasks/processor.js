(function () {
    'use strict';

    module.exports = function () {
        var glob = require("glob"),
            fs = require('fs-extra'),
            path = require('path');

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
            // #1
            var templateDir = path.join(path.resolve(__dirname, '..'),'/templates/interface');
            glob.sync('**/*', {cwd: templateDir, root: '/'}).forEach(function(file) {
                fs.copySync(templateDir + path.sep + file, outputDir + path.sep + file);
            });

            var nodeModulesDir = path.join(process.cwd(), '/node_modules');
            fs.copySync(nodeModulesDir + path.sep + 'angular' + path.sep + 'angular.min.js', outputDir + path.sep + 'js' + path.sep + 'angular.min.js');
            fs.copySync(nodeModulesDir + path.sep + 'angular-resource' + path.sep + 'angular-resource.min.js', outputDir + path.sep + 'js' + path.sep + 'angular-resource.min.js');
        }

        /**
         * Copy the protractor.mock.js file to the output dir.
         * @param {string} outputDir The output directory.
         *
         * #1 update the template with the module name
         * #2 write the template to file
         */
        function generateProtractorMock(outputDir) {
            fs.copySync(path.resolve(__dirname, '..') + '/templates/protractor.mock.js', outputDir + path.sep +'protractor.mock.js');
        }

        return {
            processMocks: processMocks,
            generateMockingInterface: generateMockingInterface,
            generateProtractorMock: generateProtractorMock
        };
    };
})();