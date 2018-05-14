import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import DefaultsHandler from './handlers/api/defaults.handler';
import EchoRequestHandler from './handlers/mock/echo.request.handler';
import Middleware from './middleware';
import MockRequestHandler from './handlers/mock/mock.request.handler';
import RecordResponseHandler from './handlers/mock/record.response.handler';
import UpdateMocksHandler from './handlers/api/update-mocks.handler';
import MocksState from '../state/mocks.state';
import SetVariableHandler from './handlers/api/set-variable.handler';
import InitHandler from './handlers/api/init.handler';
import GetMocksHandler from './handlers/api/get-mocks.handler';
import GetVariablesHandler from './handlers/api/get-variables.handler';
import DeleteVariableHandler from './handlers/api/delete-variable.handler';
import PassThroughsHandler from './handlers/api/pass-throughs.handler';
import {ApplicableHandler} from './handlers/handler';
import {HttpMethods} from './http';
import Mock from '../domain/mock';
import GetRecordingsHandler from './handlers/api/get-recordings.handler';

describe('Middleware', () => {
    const APIMOCK_ID = 'apimockId';
    const HEADERS = {'some': 'header'};
    const METHOD = HttpMethods.GET;
    const BODY_STRING = '{"x":"x"}';
    const BODY = {x: 'x'};
    const SOME_URL = '/base-url';

    let applicableHandler: ApplicableHandler;
    let applicableHandlerHandleFn: sinon.SinonStub;
    let applicableHandlerIsApplicableFn: sinon.SinonStub;

    let container: Container;

    let defaultsHandler: DefaultsHandler;
    let defaultsHandlerHandleFn: sinon.SinonStub;

    let deleteVariableHandler: DeleteVariableHandler;
    let deleteVariableHandlerHandleFn: sinon.SinonStub;

    let echoRequestHandler: EchoRequestHandler;
    let echoRequestHandlerHandleFn: sinon.SinonStub;

    let getApimockIdFn: sinon.SinonStub;
    let getMatchingApplicableHandlerFn: sinon.SinonStub;

    let getMocksHandler: GetMocksHandler;
    let getMocksHandlerHandleFn: sinon.SinonStub;

    let getVariablesHandler: GetVariablesHandler;
    let getVariablesHandlerHandleFn: sinon.SinonStub;
    let getVariablesHandlerIsApplicableFn: sinon.SinonStub;

    let getRecordingsHandler: GetRecordingsHandler;
    let getRecordingsHandlerHandleFn: sinon.SinonStub;
    let getRecordingsHandlerIsApplicableFn: sinon.SinonStub;

    let initHandler: InitHandler;
    let initHandlerHandleFn: sinon.SinonStub;

    let matchingMock: Mock;
    let middleware: Middleware;

    let mockRequestHandler: MockRequestHandler;
    let mockRequestHandlerHandleFn: sinon.SinonStub;

    let mocksState: MocksState;
    let mocksStateGetMatchingMockFn: sinon.SinonStub;

    let nextFn: sinon.SinonStub;

    let passThroughsHandler: PassThroughsHandler;
    let passThroughsHandlerHandleFn: sinon.SinonStub;

    let recordResponseHandler: RecordResponseHandler;
    let recordResponseHandlerHandleFn: sinon.SinonStub;

    let request: http.IncomingMessage;
    let requestOnFn: sinon.SinonStub;

    let response: http.ServerResponse;

    let setVariableHandler: SetVariableHandler;
    let setVariableHandlerHandleFn: sinon.SinonStub;

    let updateMocksHandler: UpdateMocksHandler;
    let updateMocksHandlerHandleFn: sinon.SinonStub;

    beforeAll(() => {
        container = new Container();
        matchingMock = {
            name: 'matching-mock',
            isArray: true,
            request: {
                url: SOME_URL,
                method: METHOD
            }, responses: {}
        };
        mocksState = sinon.createStubInstance(MocksState);
        mocksStateGetMatchingMockFn = mocksState.getMatchingMock as sinon.SinonStub;
        request = sinon.createStubInstance(http.IncomingMessage);
        requestOnFn = request.on as sinon.SinonStub;
        response = sinon.createStubInstance(http.ServerResponse);
        defaultsHandler = sinon.createStubInstance(DefaultsHandler);
        defaultsHandlerHandleFn = defaultsHandler.handle as sinon.SinonStub;
        deleteVariableHandler = sinon.createStubInstance(DeleteVariableHandler);
        deleteVariableHandlerHandleFn = deleteVariableHandler.handle as sinon.SinonStub;
        echoRequestHandler = sinon.createStubInstance(EchoRequestHandler);
        echoRequestHandlerHandleFn = echoRequestHandler.handle as sinon.SinonStub;
        getMocksHandler = sinon.createStubInstance(GetMocksHandler);
        getMocksHandlerHandleFn = getMocksHandler.handle as sinon.SinonStub;
        getVariablesHandler = sinon.createStubInstance(GetVariablesHandler);
        getVariablesHandlerHandleFn = getVariablesHandler.handle as sinon.SinonStub;
        getVariablesHandlerIsApplicableFn = getVariablesHandler.isApplicable as sinon.SinonStub;
        getRecordingsHandler = sinon.createStubInstance(GetRecordingsHandler);
        getRecordingsHandlerHandleFn = getRecordingsHandler.handle as sinon.SinonStub;
        getRecordingsHandlerIsApplicableFn = getRecordingsHandler.isApplicable as sinon.SinonStub;
        applicableHandlerHandleFn = sinon.stub();
        applicableHandlerIsApplicableFn = sinon.stub();
        applicableHandler = {handle: applicableHandlerHandleFn, isApplicable: applicableHandlerIsApplicableFn};
        initHandler = sinon.createStubInstance(InitHandler);
        initHandlerHandleFn = initHandler.handle as sinon.SinonStub;
        mockRequestHandler = sinon.createStubInstance(MockRequestHandler);
        mockRequestHandlerHandleFn = mockRequestHandler.handle as sinon.SinonStub;
        passThroughsHandler = sinon.createStubInstance(PassThroughsHandler);
        passThroughsHandlerHandleFn = passThroughsHandler.handle as sinon.SinonStub;
        recordResponseHandler = sinon.createStubInstance(RecordResponseHandler);
        recordResponseHandlerHandleFn = recordResponseHandler.handle as sinon.SinonStub;
        setVariableHandler = sinon.createStubInstance(SetVariableHandler);
        setVariableHandlerHandleFn = setVariableHandler.handle as sinon.SinonStub;
        updateMocksHandler = sinon.createStubInstance(UpdateMocksHandler);
        updateMocksHandlerHandleFn = updateMocksHandler.handle as sinon.SinonStub;

        container.bind<DefaultsHandler>('DefaultsHandler').toConstantValue(defaultsHandler);
        container.bind<DeleteVariableHandler>('DeleteVariableHandler').toConstantValue(deleteVariableHandler);
        container.bind<EchoRequestHandler>('EchoRequestHandler').toConstantValue(echoRequestHandler);
        container.bind<GetMocksHandler>('GetMocksHandler').toConstantValue(getMocksHandler);
        container.bind<GetVariablesHandler>('GetVariablesHandler').toConstantValue(getVariablesHandler);
        container.bind<GetRecordingsHandler>('GetRecordingsHandler').toConstantValue(getRecordingsHandler);
        container.bind<InitHandler>('InitHandler').toConstantValue(initHandler);
        container.bind<MockRequestHandler>('MockRequestHandler').toConstantValue(mockRequestHandler);
        container.bind<MocksState>('MocksState').toConstantValue(mocksState);
        container.bind<PassThroughsHandler>('PassThroughsHandler').toConstantValue(passThroughsHandler);
        container.bind<SetVariableHandler>('SetVariableHandler').toConstantValue(setVariableHandler);
        container.bind<RecordResponseHandler>('RecordResponseHandler').toConstantValue(recordResponseHandler);
        container.bind<UpdateMocksHandler>('UpdateMocksHandler').toConstantValue(updateMocksHandler);
        container.bind<Middleware>('Middleware').to(Middleware);
        nextFn = sinon.stub();

        middleware = container.get<Middleware>('Middleware');
        getApimockIdFn = sinon.stub(Middleware.prototype, <any>'getApimockId');
        getMatchingApplicableHandlerFn = sinon.stub(Middleware.prototype, <any>'getMatchingApplicableHandler');
    });

    describe('middleware', () => {
        describe('matching applicable handler', () => {
            beforeEach(() => {
                getApimockIdFn.returns(APIMOCK_ID);
                getMatchingApplicableHandlerFn.returns(applicableHandler);
                request.headers = HEADERS;
                requestOnFn.onCall(0).returns(request);

                middleware.middleware(request, response, nextFn);

                requestOnFn.getCall(0).args[1](new Buffer(BODY_STRING));
                requestOnFn.getCall(1).args[1]();
            });

            it('gets the apimock id', () =>
                sinon.assert.called(getApimockIdFn));

            it('gets the matching applicable handler', () =>
                sinon.assert.calledWith(getMatchingApplicableHandlerFn, request, BODY));

            it('calls the handler.handle', () =>
                sinon.assert.calledWith(applicableHandlerHandleFn, request, response, nextFn, {id: APIMOCK_ID, body: BODY}));

            afterEach(() => {
                requestOnFn.reset();
                getApimockIdFn.reset();
                getMatchingApplicableHandlerFn.reset();
            });
        });

        describe('matching mock', () => {
            describe('always', () => {
                beforeEach(() => {
                    getApimockIdFn.returns(APIMOCK_ID);
                    getMatchingApplicableHandlerFn.returns(undefined);
                    mocksStateGetMatchingMockFn.returns(matchingMock);
                    request.url = SOME_URL;
                    request.method = METHOD;
                    request.headers = HEADERS;
                    requestOnFn.onCall(0).returns(request);

                    middleware.middleware(request, response, nextFn);

                    requestOnFn.getCall(0).args[1](new Buffer(BODY_STRING));
                    requestOnFn.getCall(1).args[1]();
                });

                it('gets the apimock id', () =>
                    sinon.assert.called(getApimockIdFn));

                it('gets the matching applicable handler', () =>
                    sinon.assert.calledWith(getMatchingApplicableHandlerFn, request, {x: 'x'}));

                it('gets the matching mock', () =>
                    sinon.assert.calledWith(mocksStateGetMatchingMockFn, SOME_URL, METHOD, HEADERS, BODY));

                it('calls the echo request handler', () =>
                    sinon.assert.calledWith(echoRequestHandlerHandleFn, request, response, nextFn, {
                        id: APIMOCK_ID,
                        mock: matchingMock,
                        body: BODY
                    }));

                afterEach(() => {
                    requestOnFn.reset();
                    getApimockIdFn.reset();
                    getMatchingApplicableHandlerFn.reset();
                });
            });

            describe('recording is enabled', () => {
                beforeEach(() => {
                    mocksState.record = true;
                    getApimockIdFn.returns(APIMOCK_ID);
                    getMatchingApplicableHandlerFn.returns(undefined);
                    mocksStateGetMatchingMockFn.returns(matchingMock);
                    request.url = SOME_URL;
                    request.method = METHOD;
                    request.headers = HEADERS;
                    requestOnFn.onCall(0).returns(request);
                });

                describe('record header is present', () => {
                    beforeEach(() => {
                        request.headers.record = 'true';
                        middleware.middleware(request, response, nextFn);

                        requestOnFn.getCall(0).args[1](new Buffer(BODY_STRING));
                        requestOnFn.getCall(1).args[1]();
                    });

                    it('does not call the record response handler', () =>
                        sinon.assert.notCalled(recordResponseHandlerHandleFn));
                });

                describe('record header is not present', () => {
                    beforeEach(() => {
                        request.headers.record = undefined;
                        middleware.middleware(request, response, nextFn);

                        requestOnFn.getCall(0).args[1](new Buffer(BODY_STRING));
                        requestOnFn.getCall(1).args[1]();
                    });

                    it('calls the record response handler', () =>
                        sinon.assert.calledWith(recordResponseHandlerHandleFn, request, response, nextFn, {
                            mock: matchingMock,
                            body: BODY
                        }));

                });


                afterEach(() => {
                    requestOnFn.reset();
                    getApimockIdFn.reset();
                    getMatchingApplicableHandlerFn.reset();
                    recordResponseHandlerHandleFn.reset();
                });
            });

            describe('recording is disabled', () => {
                beforeEach(() => {
                    mocksState.record = false;
                    getApimockIdFn.returns(APIMOCK_ID);
                    getMatchingApplicableHandlerFn.returns(undefined);
                    mocksStateGetMatchingMockFn.returns(matchingMock);
                    request.url = SOME_URL;
                    request.method = METHOD;
                    request.headers = HEADERS;
                    requestOnFn.onCall(0).returns(request);

                    middleware.middleware(request, response, nextFn);

                    requestOnFn.getCall(0).args[1](new Buffer(BODY_STRING));
                    requestOnFn.getCall(1).args[1]();
                });

                it('calls the mock request handler', () => sinon.assert.calledWith(mockRequestHandlerHandleFn, request, response, nextFn, {
                    id: APIMOCK_ID,
                    mock: matchingMock
                }));

                afterEach(() => {
                    requestOnFn.reset();
                    getApimockIdFn.reset();
                    getMatchingApplicableHandlerFn.reset();
                    mockRequestHandlerHandleFn.reset();
                });
            });
        });

        describe('no matching mock', () => {
            beforeEach(() => {
                getApimockIdFn.returns(APIMOCK_ID);
                getMatchingApplicableHandlerFn.returns(undefined);
                mocksStateGetMatchingMockFn.returns(undefined);
                requestOnFn.onCall(0).returns(request);
                request.headers = HEADERS;

                middleware.middleware(request, response, nextFn);

                requestOnFn.getCall(0).args[1](new Buffer(BODY_STRING));
                requestOnFn.getCall(1).args[1]();
            });

            it('calls next', () => sinon.assert.called(nextFn));

            afterEach(() => {
                requestOnFn.reset();
                getApimockIdFn.reset();
                getMatchingApplicableHandlerFn.reset();
                nextFn.reset();
            });
        });
    });

    describe('getMatchingApplicableHandler', () => {
        beforeEach(() => {
            getMatchingApplicableHandlerFn.callThrough();
            getVariablesHandlerIsApplicableFn.returns(true);
        });

        it('finds the applicable handler', () =>
            expect(middleware.getMatchingApplicableHandler(request, BODY)).toEqual(getVariablesHandler));

        afterEach(() => {
            getMatchingApplicableHandlerFn.reset();
            getVariablesHandlerIsApplicableFn.reset();
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
});
