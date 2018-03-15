import 'reflect-metadata';
import {Container} from 'inversify';

import * as sinon from 'sinon';

import MocksState from '../../../state/mocks.state';
import VariableHandler from './variable.handler';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('VariableHandler', () => {
    let variableHandler: VariableHandler;
    let mocksState: MocksState;

    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;
    let responseEndFn: sinon.SinonStub;
    let mocksStateGetMatchingStateFn: sinon.SinonStub;
    let handleGetVariablesFn: sinon.SinonStub;
    let handleSetVariableFn: sinon.SinonStub;
    let handleDeleteVariableFn: sinon.SinonStub;

    let container: Container;

    const APIMOCK_ID = 'apimockId';
    const DEFAULT_VARIABLES_STATE = {
        'one': 'first',
        'two': 'second',
        'three': 'third'
    };

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();
        container.bind<VariableHandler>('VariableHandler').to(VariableHandler);

        nextFn = sinon.stub();
        requestOnFn = sinon.stub();
        responseWriteHeadFn = sinon.stub();
        responseEndFn = sinon.stub();

        mocksState = container.get<MocksState>('MocksState');
        variableHandler = container.get<VariableHandler>('VariableHandler');

        mocksStateGetMatchingStateFn = sinon.stub(MocksState.prototype, <any>'getMatchingState');
        handleGetVariablesFn = sinon.stub(VariableHandler.prototype, <any>'handleGetVariables');
        handleSetVariableFn = sinon.stub(VariableHandler.prototype, <any>'handleSetVariable');
        handleDeleteVariableFn = sinon.stub(VariableHandler.prototype, <any>'handleDeleteVariable');
    });

    describe('handle', () => {
        let request: any;
        let response: any;
        let payload: any;
        let matchingState: any;

        beforeEach(() => {
            request = {
                url: '/ngapimock/variables',
                on: requestOnFn
            };
            response = {
                writeHead: responseWriteHeadFn,
                end: responseEndFn
            } as any;
            matchingState = {
                variables: JSON.parse(JSON.stringify(DEFAULT_VARIABLES_STATE)),
            };
        });

        describe('get variables', () => {
            beforeEach(() => {
                request.method = HttpMethods.GET;
                handleGetVariablesFn.callThrough();
                mocksStateGetMatchingStateFn.returns(matchingState);
            });

            it('gets the variables', () => {
                variableHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: {} as any});
                sinon.assert.calledWith(handleGetVariablesFn, response, matchingState);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.calledWith(responseEndFn, JSON.stringify({
                    'state':
                        {
                            'one': 'first',
                            'two': 'second',
                            'three': 'third'
                        }
                }));
            });

            afterEach(() => {
                responseWriteHeadFn.reset();
                responseEndFn.reset();
                handleGetVariablesFn.reset();
                handleSetVariableFn.reset();
                handleDeleteVariableFn.reset();
            });
        });

        describe('set variable', () => {
            beforeEach(() => {
                request.method = HttpMethods.PUT;
                handleSetVariableFn.callThrough();
                mocksStateGetMatchingStateFn.returns(matchingState);
            });

            it('sets the variable', () => {
                payload = {
                    'four': 'fourth'
                } as any;
                variableHandler.handle(request, response, nextFn, {
                    id: APIMOCK_ID, payload: payload
                });
                sinon.assert.calledWith(handleSetVariableFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
                expect(matchingState.variables['four']).toBe('fourth');
            });

            it('sets the variables', () => {
                payload = {
                    'five': 'fifth',
                    'six': 'sixth'
                } as any;
                variableHandler.handle(request, response, nextFn, {
                    id: APIMOCK_ID, payload: payload
                });
                sinon.assert.calledWith(handleSetVariableFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
                expect(matchingState.variables['five']).toBe('fifth');
                expect(matchingState.variables['six']).toBe('sixth');
            });

            it('throw error if no key value pair is present', () => {
                payload = {
                } as any;

                variableHandler.handle(request, response, nextFn, {
                    id: APIMOCK_ID, payload: payload
                });

                sinon.assert.calledWith(handleSetVariableFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.calledWith(responseEndFn, `{"message":"A variable should have a key and value"}`);
            });

            afterEach(() => {
                responseWriteHeadFn.reset();
                responseEndFn.reset();
                handleGetVariablesFn.reset();
                handleSetVariableFn.reset();
                handleDeleteVariableFn.reset();
            });
        });

        describe('delete variable', () => {
            beforeEach(() => {
                request.method = HttpMethods.DELETE;
                request.url = '/ngapimock/variables/one';
                handleDeleteVariableFn.callThrough();
                mocksStateGetMatchingStateFn.returns(matchingState);
            });

            it('deletes the variable', () => {
                expect(Object.keys(matchingState.variables).length).toBe(3);
                variableHandler.handle(request, response, nextFn, {
                    id: APIMOCK_ID, payload: payload
                });
                sinon.assert.calledWith(handleDeleteVariableFn, response, matchingState, request.url);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
                expect(Object.keys(matchingState.variables).length).toBe(2);
            });

            afterEach(() => {
                responseWriteHeadFn.reset();
                responseEndFn.reset();
                handleGetVariablesFn.reset();
                handleSetVariableFn.reset();
                handleDeleteVariableFn.reset();
            });
        });

        afterEach(() => {
            mocksStateGetMatchingStateFn.reset();
            responseWriteHeadFn.reset();
            responseEndFn.reset();
            handleGetVariablesFn.reset();
            handleSetVariableFn.reset();
            handleDeleteVariableFn.reset();
        });
    });

    afterAll(() => {
        mocksStateGetMatchingStateFn.restore();
        handleGetVariablesFn.restore();
        handleSetVariableFn.restore();
        handleDeleteVariableFn.restore();
    });
});