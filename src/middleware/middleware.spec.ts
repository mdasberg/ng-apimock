import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import ActionHandler from './handlers/api/action.handler';
import EchoRequestHandler from './handlers/mock/echo.request.handler';
import Middleware from './middleware';
import MockRequestHandler from './handlers/mock/mock.request.handler';
import RecordResponseHandler from './handlers/mock/record.response.handler';
import ScenarioHandler from './handlers/api/scenario.handler';
import MocksState from '../state/mocks.state';
import {HttpMethods} from './http';
import Mock from '../domain/mock';

describe('Middleware', () => {
    let middleware: Middleware;
    let mocksState: MocksState;

    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let getApimockIdFn: sinon.SinonStub;
    let scenarioHandlerHandleFn: sinon.SinonStub;
    let actionHandlerHandleFn: sinon.SinonStub;
    let apimockStateGetMatchingMockFn: sinon.SinonStub;
    let echoRequestHandlerHandleFn: sinon.SinonStub;
    let recordResponseHandlerHandleFn: sinon.SinonStub;
    let mockRequestHandlerHandleFn: sinon.SinonStub;

    let container: Container;

    const APIMOCK_ID = 'apimockId';

    beforeAll(() => {
        container = new Container();
        container.bind<MockRequestHandler>('MockRequestHandler').to(MockRequestHandler);
        container.bind<EchoRequestHandler>('EchoRequestHandler').to(EchoRequestHandler);
        container.bind<RecordResponseHandler>('RecordResponseHandler').to(RecordResponseHandler);
        container.bind<ScenarioHandler>('ScenarioHandler').to(ScenarioHandler);
        container.bind<ActionHandler>('ActionHandler').to(ActionHandler);
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();

        container.bind<Middleware>('Middleware').to(Middleware);
        nextFn = sinon.stub();
        requestOnFn = sinon.stub();
        mocksState = container.get<MocksState>('MocksState');
        middleware = container.get<Middleware>('Middleware');

        getApimockIdFn = sinon.stub(Middleware.prototype, 'getApimockId');
        scenarioHandlerHandleFn = sinon.stub(ScenarioHandler.prototype, 'handle');
        actionHandlerHandleFn = sinon.stub(ActionHandler.prototype, 'handle');
        apimockStateGetMatchingMockFn = sinon.stub(MocksState.prototype, 'getMatchingMock');
        echoRequestHandlerHandleFn = sinon.stub(EchoRequestHandler.prototype, 'handle');
        recordResponseHandlerHandleFn = sinon.stub(RecordResponseHandler.prototype, 'handle');
        mockRequestHandlerHandleFn = sinon.stub(MockRequestHandler.prototype, 'handle');

    });

    describe('middleware', () => {
        describe('scenario request', () => {
            it('calls the scenarioHandler', () => {
                getApimockIdFn.returns(APIMOCK_ID);
                const request = {
                    url: '/ngapimock/mocks'
                } as http.IncomingMessage;
                const response = {} as http.ServerResponse;

                middleware.middleware(request, response, nextFn);
                sinon.assert.called(getApimockIdFn);
                sinon.assert.calledWith(scenarioHandlerHandleFn, request, response, nextFn, {id: APIMOCK_ID});
            });

            afterEach(() => {
                apimockStateGetMatchingMockFn.reset();
                actionHandlerHandleFn.reset();
                getApimockIdFn.reset();
                requestOnFn.reset();
                scenarioHandlerHandleFn.reset();
                echoRequestHandlerHandleFn.reset();
                recordResponseHandlerHandleFn.reset();
                mockRequestHandlerHandleFn.reset();
                nextFn.reset();
            });
        });

        describe('action request', () => {
            it('calls the actionHandler', () => {
                getApimockIdFn.returns(APIMOCK_ID);
                const request = {
                    url: '/ngapimock/actions',
                    method: HttpMethods.PUT
                } as http.IncomingMessage;
                const response = {} as http.ServerResponse;

                middleware.middleware(request, response, nextFn);
                sinon.assert.called(getApimockIdFn);
                sinon.assert.calledWith(actionHandlerHandleFn, request, response, nextFn, {id: APIMOCK_ID});
            });

            afterEach(() => {
                apimockStateGetMatchingMockFn.reset();
                actionHandlerHandleFn.reset();
                getApimockIdFn.reset();
                requestOnFn.reset();
                scenarioHandlerHandleFn.reset();
                echoRequestHandlerHandleFn.reset();
                recordResponseHandlerHandleFn.reset();
                mockRequestHandlerHandleFn.reset();
                nextFn.reset();
            });
        });

        describe('mock request', () => {
            let request: any;
            let matchingMock: Mock;
            let response: http.ServerResponse;

            beforeEach(() => {
                request = {
                    url: '/some/api',
                    method: HttpMethods.GET,
                    headers: {},
                    on: requestOnFn
                } as any;

                matchingMock = {
                    name: 'match'
                } as Mock;

                response = {} as http.ServerResponse;

                requestOnFn.onCall(0).returns(request);
                apimockStateGetMatchingMockFn.returns(matchingMock);
                getApimockIdFn.returns(APIMOCK_ID);
            });

            describe('by default', () => {
                beforeEach(() => {
                    middleware.middleware(request, response, nextFn);
                });

                it('gets the matching mock with payload', () => {
                    sinon.assert.calledWith(requestOnFn, 'data');
                    sinon.assert.calledWith(requestOnFn, 'end');

                    requestOnFn.getCall(0).args[1](new Buffer('{"x":"x"}'));
                    requestOnFn.getCall(1).args[1]();

                    sinon.assert.calledWith(apimockStateGetMatchingMockFn, request.url, request.method, request.headers, {x: 'x'});
                });

                it('gets the matching mock without payload', () => {
                    sinon.assert.calledWith(requestOnFn, 'data');
                    sinon.assert.calledWith(requestOnFn, 'end');

                    requestOnFn.getCall(1).args[1]();

                    sinon.assert.calledWith(apimockStateGetMatchingMockFn, request.url, request.method, request.headers, {});
                });
                it('calls the echoHandler', () => {
                    sinon.assert.calledWith(requestOnFn, 'data');
                    sinon.assert.calledWith(requestOnFn, 'end');

                    requestOnFn.getCall(1).args[1]();

                    sinon.assert.called(getApimockIdFn);
                    sinon.assert.calledWith(echoRequestHandlerHandleFn, request, response, nextFn, {
                        id: APIMOCK_ID,
                        mock: matchingMock,
                        payload: {}
                    });
                });

                afterEach(() => {
                    apimockStateGetMatchingMockFn.reset();
                    actionHandlerHandleFn.reset();
                    getApimockIdFn.reset();
                    requestOnFn.reset();
                    scenarioHandlerHandleFn.reset();
                    echoRequestHandlerHandleFn.reset();
                    recordResponseHandlerHandleFn.reset();
                    mockRequestHandlerHandleFn.reset();
                    nextFn.reset();
                });
            });

            describe('record request', () => {
                beforeEach(() => {
                    mocksState.record = true;
                    middleware.middleware(request, response, nextFn);
                });

                it('calls the recordHandler', () => {
                    requestOnFn.getCall(1).args[1]();

                    sinon.assert.called(getApimockIdFn);
                    sinon.assert.calledWith(recordResponseHandlerHandleFn, request, response, nextFn, {mock: matchingMock});
                });

                afterEach(() => {
                    apimockStateGetMatchingMockFn.reset();
                    actionHandlerHandleFn.reset();
                    getApimockIdFn.reset();
                    requestOnFn.reset();
                    scenarioHandlerHandleFn.reset();
                    echoRequestHandlerHandleFn.reset();
                    recordResponseHandlerHandleFn.reset();
                    mockRequestHandlerHandleFn.reset();
                    nextFn.reset();
                });
            });

            describe('mock request', () => {
                it('calls the mockRequestHandler when recording is false', () => {
                    mocksState.record = false;
                    middleware.middleware(request, response, nextFn);
                    requestOnFn.getCall(1).args[1]();

                    sinon.assert.called(getApimockIdFn);
                    sinon.assert.calledWith(mockRequestHandlerHandleFn, request, response, nextFn, {id: APIMOCK_ID, mock: matchingMock});
                });

                it('calls the mockRequestHandler when request.headers.record is true', () => {
                    mocksState.record = true;
                    request.headers.record = true;
                    middleware.middleware(request, response, nextFn);
                    requestOnFn.getCall(1).args[1]();

                    sinon.assert.called(getApimockIdFn);
                    sinon.assert.calledWith(mockRequestHandlerHandleFn, request, response, nextFn, {id: APIMOCK_ID, mock: matchingMock});
                });

                afterEach(() => {
                    apimockStateGetMatchingMockFn.reset();
                    actionHandlerHandleFn.reset();
                    getApimockIdFn.reset();
                    requestOnFn.reset();
                    scenarioHandlerHandleFn.reset();
                    echoRequestHandlerHandleFn.reset();
                    recordResponseHandlerHandleFn.reset();
                    mockRequestHandlerHandleFn.reset();
                    nextFn.reset();
                });
            });

            describe('else request', () => {
                let request: any;
                let matchingMock: Mock;
                let response: http.ServerResponse;

                beforeEach(() => {
                    request = {
                        url: '/some/api',
                        method: HttpMethods.GET,
                        headers: {},
                        on: requestOnFn
                    } as any;

                    matchingMock = undefined;

                    response = {} as http.ServerResponse;

                    requestOnFn.onCall(0).returns(request);
                    apimockStateGetMatchingMockFn.returns(matchingMock);
                    getApimockIdFn.returns(APIMOCK_ID);

                    middleware.middleware(request, response, nextFn);
                });

                it('calls next()', () => {
                    sinon.assert.calledWith(requestOnFn, 'data');
                    sinon.assert.calledWith(requestOnFn, 'end');

                    requestOnFn.getCall(1).args[1]();

                    sinon.assert.calledWith(apimockStateGetMatchingMockFn, request.url, request.method, request.headers, {});
                    sinon.assert.called(nextFn);
                });

                afterEach(() => {
                    apimockStateGetMatchingMockFn.reset();
                    actionHandlerHandleFn.reset();
                    getApimockIdFn.reset();
                    requestOnFn.reset();
                    scenarioHandlerHandleFn.reset();
                    echoRequestHandlerHandleFn.reset();
                    recordResponseHandlerHandleFn.reset();
                    mockRequestHandlerHandleFn.reset();
                    nextFn.reset();
                });

            });

            afterEach(() => {
                apimockStateGetMatchingMockFn.reset();
                actionHandlerHandleFn.reset();
                getApimockIdFn.reset();
                requestOnFn.reset();
                scenarioHandlerHandleFn.reset();
                echoRequestHandlerHandleFn.reset();
                recordResponseHandlerHandleFn.reset();
                mockRequestHandlerHandleFn.reset();
            });
        });
    });

    describe('getApimockId', () => {
        beforeEach(() => {
            getApimockIdFn.callThrough();
        });
        describe('apimockId cookie is present', () =>
            it('returns the apimockId', () =>
                expect(middleware.getApimockId({cookie: 'a=a;apimockid=123;c=c'})).toBe('123')));

        describe('apimockId cookie is not present', () =>
            it('returns undefined', () =>
                expect(middleware.getApimockId({cookie: 'a=a;b=b;c=c'})).toBe(undefined)));
    });

    afterAll(() => {
        apimockStateGetMatchingMockFn.restore();
        actionHandlerHandleFn.restore();
        getApimockIdFn.restore();
        scenarioHandlerHandleFn.restore();
        echoRequestHandlerHandleFn.restore();
        recordResponseHandlerHandleFn.restore();
        mockRequestHandlerHandleFn.restore();
    });
});
