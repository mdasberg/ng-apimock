import 'reflect-metadata';
import {Container} from 'inversify';

import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import * as sinon from 'sinon';

import MocksProcessor from './processor';
import MocksState from '../state/mocks.state';

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
            globSyncFn.returns(['mock/one.json', 'mock/two.json', 'mock/duplicate-one.json', 'mock/three.json']);
            fsReadJsonSyncFn.onCall(0).returns({name: 'one', responses: {'x': {default: true}}});
            fsReadJsonSyncFn.onCall(1).returns({name: 'two', responses: {'x': {default: true, echo: true, delay: 2000}}});
            fsReadJsonSyncFn.onCall(2).returns({name: 'one', responses: {'x': {}, 'y': {default: true}}});
            fsReadJsonSyncFn.onCall(3).returns({name: 'three', responses: {'x': {}}});

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
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/one.json'));
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/two.json'));
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/duplicate-one.json'));
            sinon.assert.calledWith(fsReadJsonSyncFn, path.join(SRC, 'mock/three.json'));
        });

        it('overrides a duplicate mock', () => {
            sinon.assert.calledWith(consoleWarnFn, `Mock with identifier 'one' already exists. Overwriting existing mock.`)
        });

        it('sets the defaults', () => {
            expect(mocksState.defaults).toEqual({
                one: {scenario: 'y', echo: false, delay: 0}, // default delay
                two: {scenario: 'x', echo: false, delay: 2000}, // delay specified in the mock
                three: {scenario: 'passThrough', echo: false, delay: 0} // passThrough because no default has been specified
            });
        });

        it('sets the global mocks', () => {
            expect(mocksState.global.mocks).toEqual({
                one: {scenario: 'y', echo: false, delay: 0}, // default delay
                two: {scenario: 'x', echo: false, delay: 2000}, // delay specified in the mock
                three: {scenario: 'passThrough', echo: false, delay: 0} // passThrough because no default has been specified
            });
        });

        it('processes 2 unique mocks', () => {
            sinon.assert.calledWith(consoleLogFn, `Processed 3 unique mocks.`);
        });
    });

    afterAll(() => {
        consoleWarnFn.restore();
        consoleLogFn.restore();
        fsReadJsonSyncFn.restore();
        globSyncFn.restore();
    });
});
