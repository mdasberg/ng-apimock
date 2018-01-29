import 'reflect-metadata';
import {Container} from 'inversify';

import * as sinon from 'sinon';

import ScenarioHandler from './scenario.handler';
import MocksState from '../../../state/mocks.state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('ScenarioHandler', () => {
    let scenarioHandler: ScenarioHandler;
    let mocksState: MocksState;

    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;
    let responseEndFn: sinon.SinonStub;
    let mocksStateGetMatchingStateFn: sinon.SinonStub;
    let handleGetMocksFn: sinon.SinonStub;
    let handleSelectMockScenarioFn: sinon.SinonStub;

    let container: Container;

    const APIMOCK_ID = 'apimockId';
    const DEFAULT_MOCKS_STATE = {
        'one': {
            scenario: 'some',
            delay: 0,
            echo: true
        },
        'two': {
            scenario: 'thing',
            delay: 1000,
            echo: false
        }
    };

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();
        container.bind<ScenarioHandler>('ScenarioHandler').to(ScenarioHandler);

        nextFn = sinon.stub();
        requestOnFn = sinon.stub();
        responseWriteHeadFn = sinon.stub();
        responseEndFn = sinon.stub();

        mocksState = container.get<MocksState>('MocksState');
        scenarioHandler = container.get<ScenarioHandler>('ScenarioHandler');

        mocksStateGetMatchingStateFn = sinon.stub(MocksState.prototype, 'getMatchingState');
        handleGetMocksFn = sinon.stub(ScenarioHandler.prototype, 'handleGetMocks');
        handleSelectMockScenarioFn = sinon.stub(ScenarioHandler.prototype, 'handleSelectMockScenario');
    });

    describe('handle', () => {
        let request: any;
        let response: any;
        let matchingState: any;

        beforeEach(() => {
            request = {
                url: '/action/url',
                on: requestOnFn
            };
            response = {
                writeHead: responseWriteHeadFn,
                end: responseEndFn
            } as any;
            mocksState.mocks = [
                {
                    name: 'one',
                    request: {
                        url: '/one',
                        method: 'GET'
                    }, responses: {
                        'some': {},
                        'thing': {}
                    }
                },
                {
                    name: 'two',
                    request: {
                        url: '/two',
                        method: 'POST'
                    }, responses: {
                        'some': {},
                        'thing': {}
                    }
                }
            ];
            matchingState = {
                mocks: JSON.parse(JSON.stringify(DEFAULT_MOCKS_STATE)),
                variables: {}
            };
        });

        describe('get mocks', () => {
            beforeEach(() => {
                request.method = HttpMethods.GET;
                handleGetMocksFn.callThrough();
                mocksStateGetMatchingStateFn.returns(matchingState);
            });

            it('gets the mocks', () => {
                scenarioHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: {} as any});
                sinon.assert.calledWith(handleGetMocksFn, response, matchingState);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.calledWith(responseEndFn, JSON.stringify({
                    state: matchingState.mocks,
                    recordings: mocksState.recordings,
                    mocks: [{
                        name: mocksState.mocks[0].name,
                        request: mocksState.mocks[0].request,
                        responses: ['some', 'thing'] // all the response identifiers
                    }, {
                        name: mocksState.mocks[1].name,
                        request: mocksState.mocks[1].request,
                        responses: ['some', 'thing'] // all the response identifiers
                    }]
                }));

            });

            afterEach(() => {
                responseWriteHeadFn.reset();
                responseEndFn.reset();
                handleGetMocksFn.reset();
                handleSelectMockScenarioFn.reset();
            });
        });

        describe('select mock', () => {
            let payload: any;
            beforeEach(() => {
                request.method = HttpMethods.PUT;
                handleSelectMockScenarioFn.callThrough();
                matchingState.mocks = JSON.parse(JSON.stringify(DEFAULT_MOCKS_STATE));
                mocksStateGetMatchingStateFn.returns(matchingState);
            });

            it('sets the echo', () => {
                payload = {
                    name: 'two',
                    echo: true
                };
                scenarioHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});

                expect(matchingState.mocks[payload.name].echo).toBe(payload.echo);
                sinon.assert.calledWith(handleSelectMockScenarioFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
            });

            it('sets the delay', () => {
                payload = {
                    name: 'two',
                    delay: 1000
                };
                scenarioHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});

                expect(matchingState.mocks[payload.name].delay).toBe(payload.delay);
                sinon.assert.calledWith(handleSelectMockScenarioFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
            });

            it('selects a mocks', () => {
                payload = {
                    name: 'two',
                    scenario: 'thing'
                };
                scenarioHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});

                expect(matchingState.mocks[payload.name].scenario).toBe(payload.scenario);
                sinon.assert.calledWith(handleSelectMockScenarioFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
            });

            it('selects passThrough', () => {
                payload = {
                    name: 'two',
                    scenario: 'passThrough'
                };
                scenarioHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});

                expect(matchingState.mocks[payload.name].scenario).toBe(payload.scenario);
                sinon.assert.calledWith(handleSelectMockScenarioFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
            });


            it('throw error if scenario does not exist', () => {
                payload = {
                    name: 'two',
                    scenario: 'non-existing'
                };

                scenarioHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});

                expect(matchingState.mocks[payload.name].scenario).toBe((DEFAULT_MOCKS_STATE as any)[payload.name].scenario);
                sinon.assert.calledWith(handleSelectMockScenarioFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.calledWith(responseEndFn, `{"message":"No scenario matching ['${payload.scenario}'] found"}`);
            });

            it('throw error if mock does not exist', () => {
                payload = {
                    name: 'non-existing',
                    scenario: 'non-existing'
                };

                scenarioHandler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});

                sinon.assert.calledWith(handleSelectMockScenarioFn, response, matchingState, payload);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.calledWith(responseEndFn, `{"message":"No mock matching name ['${payload.name}'] found"}`);
            });

            afterEach(() => {
                responseWriteHeadFn.reset();
                responseEndFn.reset();
                handleGetMocksFn.reset();
                handleSelectMockScenarioFn.reset();
            });
        });
    });

    afterAll(() => {
        mocksStateGetMatchingStateFn.restore();
        handleGetMocksFn.restore();
        handleSelectMockScenarioFn.restore();
    });
});