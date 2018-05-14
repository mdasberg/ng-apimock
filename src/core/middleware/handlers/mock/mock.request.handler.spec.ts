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
    const APIMOCK_ID = 'apimockId';
    const BINARY_CONTENT = 'binary content';
    const INTERPOLATED_RESPONSE_DATA = 'interpolatedResponseData';
    const MOCK = {
        name: 'some',
        request: {
            method: HttpMethods.GET,
            url: '/some/url',
        }
    } as Mock;

    let clock: sinon.SinonFakeTimers;
    let container: Container;
    let fsReadFileSyncFn: sinon.SinonStub;
    let getJsonCallbackNameFn: sinon.SinonStub;
    let interpolateResponseDataFn: sinon.SinonStub;
    let mockRequestHandler: MockRequestHandler;
    let mocksState: MocksState;
    let mocksStateGetDelayFn: sinon.SinonStub;
    let mocksStateGetResponseFn: sinon.SinonStub;
    let mocksStateGetVariablesFn: sinon.SinonStub;
    let nextFn: sinon.SinonStub;
    let request: http.IncomingMessage;
    let requestOnFn: sinon.SinonStub;
    let response: http.ServerResponse;
    let responseEndFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;

    beforeAll(() => {
        clock = sinon.useFakeTimers();
        container = new Container();
        mocksState = sinon.createStubInstance(MocksState);
        mocksStateGetResponseFn = mocksState.getResponse as sinon.SinonStub;
        mocksStateGetVariablesFn = mocksState.getVariables as sinon.SinonStub;
        mocksStateGetDelayFn = mocksState.getDelay as sinon.SinonStub;
        nextFn = sinon.stub();
        request = sinon.createStubInstance(http.IncomingMessage);
        requestOnFn = request.on as sinon.SinonStub;
        response = sinon.createStubInstance(http.ServerResponse);
        responseEndFn = response.end as sinon.SinonStub;
        responseWriteHeadFn = response.writeHead as sinon.SinonStub;

        container.bind<MocksState>('MocksState').toConstantValue(mocksState);
        container.bind<MockRequestHandler>('MockRequestHandler').to(MockRequestHandler);

        mockRequestHandler = container.get<MockRequestHandler>('MockRequestHandler');
        fsReadFileSyncFn = sinon.stub(fs, <any>'readFileSync');
        getJsonCallbackNameFn = sinon.stub(MockRequestHandler.prototype, <any>'getJsonCallbackName');
        interpolateResponseDataFn = sinon.stub(MockRequestHandler.prototype, <any>'interpolateResponseData');
    });

    describe('handle', () => {
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
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: MOCK});

                    sinon.assert.calledWith(mocksStateGetResponseFn, MOCK.name, APIMOCK_ID);
                    sinon.assert.calledWith(mocksStateGetDelayFn, MOCK.name, APIMOCK_ID);
                    sinon.assert.calledWith(fsReadFileSyncFn, mockResponse.file);

                    clock.tick(1000);
                    sinon.assert.calledWith(responseWriteHeadFn, mockResponse.status, mockResponse.headers);
                    sinon.assert.calledWith(responseEndFn, BINARY_CONTENT);
                });

                it('wraps the body in a json callback', () => {
                    getJsonCallbackNameFn.returns('callback');
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: MOCK});

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
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: MOCK});

                    sinon.assert.calledWith(mocksStateGetResponseFn, MOCK.name, APIMOCK_ID);
                    sinon.assert.calledWith(mocksStateGetVariablesFn, APIMOCK_ID);
                    sinon.assert.calledWith(mocksStateGetDelayFn, MOCK.name, APIMOCK_ID);
                    sinon.assert.calledWith(interpolateResponseDataFn, mockResponse.data, variables);

                    clock.tick(1000);
                    sinon.assert.calledWith(responseWriteHeadFn, mockResponse.status, mockResponse.headers);
                    sinon.assert.calledWith(responseEndFn, INTERPOLATED_RESPONSE_DATA);
                });

                it('wraps the body in a json callback', () => {
                    getJsonCallbackNameFn.returns('callback');
                    mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: MOCK});

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

                mockRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: MOCK});

                sinon.assert.calledWith(mocksStateGetResponseFn, MOCK.name, APIMOCK_ID);
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
        getJsonCallbackNameFn.restore();
        interpolateResponseDataFn.restore();
        clock.restore();
        fsReadFileSyncFn.restore();
    });
});
