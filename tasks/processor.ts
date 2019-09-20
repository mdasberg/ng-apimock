import * as glob from 'glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import Mock from './mock';

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
            root: '/'
        }).forEach((file) =>
            mocks.push(fs.readJsonSync(path.join(directory, file))));

        const dynamicMocks = glob.sync('**/*.builder.js', {
            cwd: directory,
            root: '/'
        }).map(file => {
            return require(path.relative(path.resolve(__dirname), path.resolve(path.join(directory, file))));
        });

        dynamicMocks.forEach(mock => {
            if(mock.default) {
                mocks.push(mock.default);
            }
        })

        return mocks;
    }

    /**
     * Generates the protractor.mock.js file in the given output directory.
     * @param {string} directory The output directory
     * @param {string} baseUrl The requests baseUrl
     */
    generateProtractorMock(directory: string, baseUrl: string): void {

        const from = path.join(Processor.PTD, 'protractor.mock.js');
        const to = path.join(directory, 'protractor.mock.js');

        if (baseUrl) {

            try {
                const data = fs.readFileSync(from, 'utf-8');
                const newValue = data.replace(/const requestUrl = undefined;/gi, 'const requestUrl = \'' + baseUrl + '\';');
                fs.writeFileSync(to, newValue, 'utf-8');
            } catch (error) {
                console.error('Unable to rewrite protractor.mock.js', error);
            }

        } else {
            fs.copySync(from, to);
        }
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
