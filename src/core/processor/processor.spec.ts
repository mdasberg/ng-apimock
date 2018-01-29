import 'reflect-metadata';
import {Container} from 'inversify';

import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import * as sinon from 'sinon';

import MocksProcessor from './processor';
import MocksState from '../state/mocks.state';
import {HttpHeaders} from '../middleware/http';

describe('MocksProcessor', () => {
    let processor: MocksProcessor;
    let container: Container;
    let mocksState: MocksState;
    let fsReadJsonSyncFn: sinon.SinonStub;
    let doneFn: sinon.SinonStub;
    let globSyncFn: sinon.SinonStub;
    let consoleWarnFn: sinon.SinonStub;
    let consoleLogFn: sinon.SinonStub;

    const SRC = 'src';
    const OUTPUT_DIR = 'outpuDir';

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();
        container.bind<MocksProcessor>('MocksProcessor').to(MocksProcessor);
        doneFn = sinon.stub();
        fsReadJsonSyncFn = sinon.stub(fs, 'readJsonSync');
        globSyncFn = sinon.stub(glob, 'sync');
        consoleWarnFn = sinon.stub(console, 'warn');
        consoleLogFn = sinon.stub(console, 'log');

        mocksState = container.get<MocksState>('MocksState');
        processor = container.get<MocksProcessor>('MocksProcessor');
    });

    describe('process', () => {
        beforeAll(() => {
            globSyncFn.returns([
                'mock/minimal-json-request.json',
                'mock/minimal-binary-request.json',
                'mock/full-request.json',
                'mock/duplicate-request.json']);
            fsReadJsonSyncFn.onCall(0).returns({
                name: 'minimal-json-request',
                request: {url: 'minimal/json/url', method: 'GET'},
                responses: {'minimal-json-response': {}}
            });
            fsReadJsonSyncFn.onCall(1).returns({
                name: 'minimal-binary-request',
                request: {url: 'minimal/binary/url', method: 'GET'},
                responses: {'minimal-binary-response': {file: 'some.pdf'}}
            });
            fsReadJsonSyncFn.onCall(2).returns({
                name: 'full-request',
                isArray: true,
                request: {url: 'full/url', method: 'GET', headers: {'Cache-control': 'no-store'}, payload: {'uuid': '\\d+'}},
                responses: {
                    'full-response': {
                        status: 404,
                        data: [{'a': 'a'}],
                        headers: {'Content-type': 'application/something'},
                        statusText: 'oops',
                        default: true,
                        delay: 1000
                    },
                    'another-full-response': {
                        status: 500,
                        data: [{'a': 'a'}],
                        headers: {'Content-type': 'application/something'},
                        file: 'some.pdf',
                        statusText: 'oops',
                        default: false,
                        delay: 0
                    }
                }
            });
            fsReadJsonSyncFn.onCall(3).returns({
                name: 'minimal-json-request',
                request: {url: 'duplicate/url', method: 'GET'},
                responses: {'duplicate-response': {}}
            });

            processor.process({
                src: SRC,
                done: doneFn,
                outputDir: OUTPUT_DIR
            });

        });

        it('processes each mock', () => {
            sinon.assert.calledWith(globSyncFn,
                '**/*.json', {
                    cwd: SRC, root: '/'
                }
            );
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/minimal-json-request.json'));
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/minimal-binary-request.json'));
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/full-request.json'));
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/duplicate-request.json'));
        });

        it('overrides a duplicate mock', () => {
            sinon.assert.calledWith(consoleWarnFn, `Mock with identifier 'minimal-json-request' already exists. Overwriting existing mock.`);
            expect(Object.keys(mocksState.mocks[0].responses)).toEqual(['duplicate-response']);
        });

        it('sets the defaults', () =>
            expect(mocksState.defaults).toEqual({
                'minimal-json-request': {scenario: 'passThrough', echo: false, delay: 0},
                'minimal-binary-request': {scenario: 'passThrough', echo: false, delay: 0},
                'full-request': {scenario: 'full-response', echo: false, delay: 1000}
            }));

        it('sets the global mocks', () =>
            expect(mocksState.global.mocks).toEqual({
                'minimal-json-request': {scenario: 'passThrough', echo: false, delay: 0},
                'minimal-binary-request': {scenario: 'passThrough', echo: false, delay: 0},
                'full-request': {scenario: 'full-response', echo: false, delay: 1000}
            }));

        it('updates the mocks with default values', () => {
            consoleLogFn.callThrough();
            expect(mocksState.mocks[0].responses).toEqual({
                'duplicate-response': {
                    status: 200, // default is status ok => 200
                    data: {}, // default if isArray is empty of false
                    headers: HttpHeaders.CONTENT_TYPE_APPLICATION_JSON, // default if no binary file is specified
                    delay: 0 // default is no delay
                }
            });
            expect(mocksState.mocks[1].responses).toEqual({
                'minimal-binary-response': {
                    status: 200, // default is status ok => 200
                    data: {}, // default if isArray is empty of false
                    headers: HttpHeaders.CONTENT_TYPE_BINARY, // default if a binary file is specified
                    file: 'some.pdf',
                    delay: 0 // default is no delay
                }
            });
            expect(mocksState.mocks[2].responses).toEqual({
                'full-response': {
                    status: 404,
                    statusText: 'oops',
                    default: true,
                    data: [{a: 'a'}],
                    headers: {'Content-type': 'application/something'}, // does not add the default headers if specified
                    delay: 1000
                },
                'another-full-response': {
                    status: 500,
                    statusText: 'oops',
                    data: [{a: 'a'}],
                    headers: {'Content-type': 'application/something'}, // does not add the default headers if specified
                    file: 'some.pdf',
                    default: false,
                    delay: 0
                }
            });
        });

        it('processes unique mocks', () =>
            sinon.assert.calledWith(consoleLogFn, `Processed 3 unique mocks.`));
    });

    afterAll(() => {
        consoleWarnFn.restore();
        consoleLogFn.restore();
        fsReadJsonSyncFn.restore();
        globSyncFn.restore();
    });
});
