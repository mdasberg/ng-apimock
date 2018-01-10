import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';

import Config from './config';
import Mock from '../domain/mock';
import MocksState from '../state/mocks.state';

/** Mocks processor. */
@injectable()
class MocksProcessor {
    private DEFAULT_DELAY = 0;
    private DEFAULT_ECHO = false;
    private PASS_THROUGH = 'passThrough';

    @inject('MocksState')
    private mocksState: MocksState;

    /**
     * Initialize apimock by:
     * - processing the globs and processing all available mocks.
     * @param {Config} config The config.
     */
    process(config: Config): void {
        glob.sync('**/*.json', {
            cwd: config.src,
            root: '/'
        }).forEach((file) => {
            const mock: Mock = fs.readJsonSync(path.join(config.src, file)) as Mock;
            const match = this.mocksState.mocks.find((_mock: Mock) => _mock.name === mock.name);
            const index = this.mocksState.mocks.indexOf(match);

            if (index > -1) { // exists so update
                console.warn(`Mock with identifier '${mock.name}' already exists. Overwriting existing mock.`);
                this.mocksState.mocks[index] = mock;
            } else { // add
                this.mocksState.mocks.push(mock);
            }

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
                    delay: mock.responses[_default].delay || this.DEFAULT_DELAY
                };
            }

            this.mocksState.defaults[mock.name] = state;
            this.mocksState.global.mocks[mock.name] = JSON.parse(JSON.stringify(state));
        });
    }
}

export default MocksProcessor;
