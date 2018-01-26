import 'reflect-metadata';
import {Container} from 'inversify';

import * as fs from 'fs-extra';
import * as http from 'http';
import * as sinon from 'sinon';

import Mock from '../../../domain/mock';
import MockRequestHandler from './mock.request.handler';
import MockResponse from '../../../domain/mock.response';
import MocksState from '../../../state/mocks.state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('MockRequestHandler', () => {
    let mockRequestHandler: MockRequestHandler;
    let mocksState: MocksState;

    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;
    let responseEndFn: sinon.SinonStub;
    let mocksStateGetResponseFn: sinon.SinonStub;
    let mocksStateGetVariablesFn: sinon.SinonStub;
    let mocksStateGetDelayFn: sinon.SinonStub;
    let interpolateResponseDataFn: sinon.SinonStub;
    let getJsonCallbackNameFn: sinon.SinonStub;
    let fsReadFileSyncFn: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;

    let container: Container;

    const APIMOCK_ID = 'apimockId';
    const INTERPOLATED_RESPONSE_DATA = 'interpolatedResponseData';
    const BINARY_CONTENT = 'binary content';

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();
        container.bind<MockRequestHandler>('MockRequestHandler').to(MockRequestHandler);

        nextFn = sinon.stub();
        requestOnFn = sinon.stub();
        responseWriteHeadFn = sinon.stub();
        responseEndFn = sinon.stub();
        clock = sinon.useFakeTimers();

        mocksState = container.get<MocksState>('MocksState');
        mockRequestHandler = container.get<MockRequestHandler>('MockRequestHandler');
        interpolateResponseDataFn = sinon.stub(MockRequestHandler.prototype, 'interpolateResponseData');
        getJsonCallbackNameFn = sinon.stub(MockRequestHandler.prototype, 'getJsonCallbackName');

        mocksStateGetResponseFn = sinon.stub(MocksState.prototype, 'getResponse');
        mocksStateGetVariablesFn = sinon.stub(MocksState.prototype, 'getVariables');
        mocksStateGetDelayFn = sinon.stub(MocksState.prototype, 'getDelay');
        fsReadFileSyncFn = sinon.stub(fs, 'readFileSync');

    });

    describe('handle', () => {
        let request: any;
        let response: any;
        let mock: Mock;

        beforeEach(() => {
            request = {
                url: '/ngapimock/mocks',
                on: requestOnFn
            };
            response = {
                writeHead: responseWriteHeadFn,
                end: responseEndFn
            } as any;
            mock = {
                name: 'some',
                request: {
                    method: HttpMethods.GET,
                    url: '/some/url',
                }
            } as Mock;
        });
        describe('selected response', () => {
            describe('binary', () => {
                let mockResponse: MockResponse;
                beforeEach(() => {
                    mockResponse = {
                        status: HttpStatusCode.OK,
                        headers: HttpHeaders.CONTENT_TYPE_BINARY,
                        file: 'some.pdf'
                    };
                    mocksStateGetResponseFn.returns(mockResponse);
                    mocksStateGetDelayFn.returns(1000);
                    fsReadFileSyncFn.returns(BINARY_CONTENT);
                    getJsonCallbackNameFn.returns(false);
                });

                it('reads the binary content and returns it as response', () => {
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: mock});

                    sinon.assert.calledWith(mocksStateGetResponseFn, mock.name, APIMOCK_ID);
                    sinon.assert.calledWith(mocksStateGetDelayFn, mock.name, APIMOCK_ID);
                    sinon.assert.calledWith(fsReadFileSyncFn, mockResponse.file);

                    clock.tick(1000);
                    sinon.assert.calledWith(responseWriteHeadFn, mockResponse.status, mockResponse.headers);
                    sinon.assert.calledWith(responseEndFn, BINARY_CONTENT);
                });

                it('wraps the payload in a json callback', () => {
                    getJsonCallbackNameFn.returns('callback');
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: mock});

                    clock.tick(1000);
                    sinon.assert.calledWith(responseWriteHeadFn, mockResponse.status, mockResponse.headers);
                    sinon.assert.calledWith(responseEndFn, `callback(${BINARY_CONTENT})`);
                });

                afterEach(() => {
                    mocksStateGetResponseFn.reset();
                    mocksStateGetVariablesFn.reset();
                    mocksStateGetDelayFn.reset();
                    getJsonCallbackNameFn.reset();
                    interpolateResponseDataFn.reset();
                    nextFn.reset();
                    fsReadFileSyncFn.reset();
                });
            });

            describe('json', () => {
                let mockResponse: MockResponse;
                let variables: any;
                beforeEach(() => {
                    mockResponse = {
                        status: HttpStatusCode.OK,
                        headers: HttpHeaders.CONTENT_TYPE_APPLICATION_JSON,
                        data: {'a': 'a%%x%%'}
                    };
                    variables = {x: 'x'};
                    mocksStateGetResponseFn.returns(mockResponse);
                    mocksStateGetVariablesFn.returns(variables);
                    mocksStateGetDelayFn.returns(1000);
                    interpolateResponseDataFn.returns(INTERPOLATED_RESPONSE_DATA);
                    getJsonCallbackNameFn.returns(false);
                });

                it('interpolates the data and returns it as response', () => {
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: mock});

                    sinon.assert.calledWith(mocksStateGetResponseFn, mock.name, APIMOCK_ID);
                    sinon.assert.calledWith(mocksStateGetVariablesFn, APIMOCK_ID);
                    sinon.assert.calledWith(mocksStateGetDelayFn, mock.name, APIMOCK_ID);
                    sinon.assert.calledWith(interpolateResponseDataFn, mockResponse.data, variables);

                    clock.tick(1000);
                    sinon.assert.calledWith(responseWriteHeadFn, mockResponse.status, mockResponse.headers);
                    sinon.assert.calledWith(responseEndFn, INTERPOLATED_RESPONSE_DATA);
                });

                it('wraps the payload in a json callback', () => {
                    getJsonCallbackNameFn.returns('callback');
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: mock});

                    clock.tick(1000);
                    sinon.assert.calledWith(responseWriteHeadFn, mockResponse.status, mockResponse.headers);
                    sinon.assert.calledWith(responseEndFn, `callback(${INTERPOLATED_RESPONSE_DATA})`);
                });

                afterEach(() => {
                    mocksStateGetResponseFn.reset();
                    mocksStateGetVariablesFn.reset();
                    mocksStateGetDelayFn.reset();
                    getJsonCallbackNameFn.reset();
                    interpolateResponseDataFn.reset();
                    nextFn.reset();
                    fsReadFileSyncFn.reset();
                });
            });
        });

        describe('no selected response', () =>
            it('calls next()', () => {
                mocksStateGetResponseFn.returns(undefined);

                mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: mock});

                sinon.assert.calledWith(mocksStateGetResponseFn, mock.name, APIMOCK_ID);
                sinon.assert.notCalled(mocksStateGetVariablesFn);
                sinon.assert.called(nextFn);
            }));

        afterEach(() => {
            mocksStateGetResponseFn.reset();
            mocksStateGetVariablesFn.reset();
            mocksStateGetDelayFn.reset();
            getJsonCallbackNameFn.reset();
            interpolateResponseDataFn.reset();
            nextFn.reset();
            fsReadFileSyncFn.reset();
        });

    });

    describe('interpolateResponseData', () => {
        beforeEach(() => {
            interpolateResponseDataFn.callThrough();
        });

        it('interpolates available variables', () =>
            expect(mockRequestHandler.interpolateResponseData({
                x: 'x is %%x%%',
                y: 'y is %%y%%'
            }, {x: 'XXX'})).toBe('{"x":"x is XXX","y":"y is %%y%%"}'));

    });

    describe('getJsonCallbackName', () => {
        beforeEach(() => {
            getJsonCallbackNameFn.callThrough();
        });
        describe('no query param callback', () =>
            it('returns false', () =>
                expect(mockRequestHandler.getJsonCallbackName({url: 'some/url'} as http.IncomingMessage)).toBe(false)));

        describe('query param callback', () =>
            it('returns the callback name', () =>
                expect(mockRequestHandler.getJsonCallbackName({url: 'some/url/?callback=callme'} as http.IncomingMessage)).toBe('callme')));
    });

    afterAll(() => {
        mocksStateGetResponseFn.restore();
        mocksStateGetVariablesFn.restore();
        mocksStateGetDelayFn.restore();
        getJsonCallbackNameFn.restore();
        interpolateResponseDataFn.restore();
        clock.restore();
        fsReadFileSyncFn.restore();
    });
});
