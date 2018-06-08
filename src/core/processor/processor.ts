import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';

import Mock from '../domain/mock';
import MocksState from '../state/mocks.state';
import {HttpHeaders, HttpStatusCode} from '../middleware/http';

/** Mocks processor. */
@injectable()
class MocksProcessor {
    @inject('MocksState')
    mocksState: MocksState;
    private DEFAULT_DELAY = 0;
    private DEFAULT_ECHO = false;
    private PASS_THROUGH = 'passThrough';

    /**
     * Initialize apimock by:
     * - processing the globs and processing all available mocks.
     * @param {string} src The src.
     */
    process(src: string): void {
        let counter = 0;
        glob.sync('**/*.json', {
            cwd: src,
            root: '/'
        }).forEach((file) => {
            const mock: Mock = fs.readJsonSync(path.join(src, file)) as Mock;
            const match = this.mocksState.mocks.find((_mock: Mock) => _mock.name === mock.name);
            const index = this.mocksState.mocks.indexOf(match);

            if (index > -1) { // exists so update
                console.warn(`Mock with identifier '${mock.name}' already exists. Overwriting existing mock.`);
                this.mocksState.mocks[index] = mock;
            } else { // add
                this.mocksState.mocks.push(mock);
                counter++;
            }

            Object.keys(mock.responses).forEach((key) => {
                const response = mock.responses[key];
                if (response.status === undefined) {
                    response.status = HttpStatusCode.OK;
                }
                if (response.data === undefined) {
                    response.data = mock.isArray ? [] : {};
                }
                if (response.headers === undefined) {
                    response.headers = response.file !== undefined ?
                        HttpHeaders.CONTENT_TYPE_BINARY :
                        HttpHeaders.CONTENT_TYPE_APPLICATION_JSON;
                }
                if (response.delay === undefined) {
                    response.delay = this.DEFAULT_DELAY;
                }
                return response;
            });

            const _default = Object.keys(mock.responses).find(key => !!mock.responses[key]['default']);
            let state: { scenario: string, echo: boolean, delay: number } = {
                scenario: this.PASS_THROUGH,
                echo: this.DEFAULT_ECHO,
                delay: this.DEFAULT_DELAY
            };

            if (_default !== undefined) {
                state = {
                    scenario: _default,
                    echo: this.DEFAULT_ECHO,
                    delay: mock.responses[_default].delay
                };
            }

            this.mocksState.defaults[mock.name] = state;
            this.mocksState.global.mocks[mock.name] = JSON.parse(JSON.stringify(state));
        });

        console.log(`Processed ${counter} unique mocks.`);
    }
}

export default MocksProcessor;
