import 'reflect-metadata';
import {Container} from 'inversify';
import * as http from 'http';
import * as sinon from 'sinon';

import Mock from '../../../domain/mock';
import RecordResponseHandler from './record.response.handler';
import MocksState from '../../../state/mocks.state';
import {HttpMethods, HttpStatusCode} from '../../http';
import HttpResponseRecording from '../../../state/httpResponseRecording';

describe('RecordResponseHandler', () => {
    let recordResponseHandler: RecordResponseHandler;
    let mocksState: MocksState;

    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let requestEndFn: sinon.SinonStub;
    let responseEndFn: sinon.SinonStub;
    let responseOnFn: sinon.SinonStub;
    let responseSetEncodingFn: sinon.SinonStub;
    let httpRequestFn: sinon.SinonStub;
    let recordFn: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;
    let now: Date;

    let container: Container;

    const PAYLOAD = '{"x":"x"}';

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();
        container.bind<RecordResponseHandler>('RecordResponseHandler').to(RecordResponseHandler);

        nextFn = sinon.stub();
        requestOnFn = sinon.stub();
        requestEndFn = sinon.stub();
        responseOnFn = sinon.stub();
        responseEndFn = sinon.stub();
        responseSetEncodingFn = sinon.stub();

        mocksState = container.get<MocksState>('MocksState');
        recordResponseHandler = container.get<RecordResponseHandler>('RecordResponseHandler');

        recordFn = sinon.stub(RecordResponseHandler.prototype, 'record');
        httpRequestFn = sinon.stub(http, 'request');
        now = new Date();
        clock = sinon.useFakeTimers(now.getTime());
    });

    describe('handle', () => {
        let request: any;
        let response: any;
        let mock: Mock;

        beforeEach(() => {
            request = {
                url: '/some/api',
                method: HttpMethods.GET,
                headers: {host: 'localhost:8888'}
            };
            response = {
                // on: responseOnFn,
                end: responseEndFn
            } as any;
            mock = {name: 'some'} as Mock;

            httpRequestFn.returns({
                on: requestOnFn,
                end: requestEndFn
            });

            recordResponseHandler.handle(request, response, nextFn, {mock: mock, payload: PAYLOAD});
        });

        it('sets the record header to off', () =>
            expect(request.headers.record).toBe('off'));

        it('calls http.request', () => {
            sinon.assert.calledWith(httpRequestFn, {
                host: 'localhost',
                port: 8888,
                path: request.url,
                method: request.method,
                headers: request.headers
            });

            sinon.assert.calledWith(requestOnFn, 'error', sinon.match.func);
            sinon.assert.called(requestEndFn);
        });

        it('on request error report the error', () => {
            requestOnFn.getCall(0).args[1]('oops');
            sinon.assert.calledWith(responseEndFn, 'oops');
        });

        it('on request data record', () => {
            httpRequestFn.getCall(0).args[1]({
                setEncoding: responseSetEncodingFn,
                on: responseOnFn,
                statusCode: HttpStatusCode.OK
            });

            sinon.assert.calledWith(responseSetEncodingFn, 'utf8');

            // call on response data
            const chunk = new Buffer('{"y":"y"}');
            responseOnFn.getCall(0).args[1](chunk);
            sinon.assert.calledWith(recordFn, PAYLOAD, chunk.toString('utf-8'), request, HttpStatusCode.OK);
            sinon.assert.calledWith(responseEndFn, chunk);
        });

        afterEach(() => {
            requestOnFn.reset();
            requestEndFn.reset();
            responseEndFn.reset();
            responseOnFn.reset();
            responseSetEncodingFn.reset();
            httpRequestFn.reset();
            httpRequestFn.reset();
            recordFn.reset();
        });
    });

    describe('record', () => {
        beforeEach(() => {
           mocksState.recordings['some'] = [];
        });
        it('stores the recording', () => {
            recordFn.callThrough();
            recordResponseHandler.record('{"x":"x"}', 'chunk', {
                method: HttpMethods.GET,
                url: 'some/api'
            } as http.IncomingMessage, HttpStatusCode.OK, 'some');

            expect(mocksState.recordings['some'][0]).toEqual({
                data: 'chunk',
                payload: '{"x":"x"}',
                datetime: now.getTime(),
                method: 'GET',
                url: 'some/api',
                statusCode: 200
            } as HttpResponseRecording);

            // convert buffer to string
            recordResponseHandler.record('{"x":"x"}', new Buffer('chunk'), {
                method: HttpMethods.GET,
                url: 'some/api'
            } as http.IncomingMessage, HttpStatusCode.OK, 'some');

            expect(mocksState.recordings['some'][0].data).toBe('chunk');
        });

        it('replaces the oldest recording if the max recordings are exceeded', () => {
            recordFn.callThrough();
            const first = {
              description: 'first'
            } as any;
            const second = {
                description: 'second'
            } as any;
            mocksState.recordings['some'].push(first);
            mocksState.recordings['some'].push(second);
            expect(mocksState.recordings['some'].length).toBe(2);

            recordResponseHandler.record('{"x":"x"}', 'chunk', {
                method: HttpMethods.GET,
                url: 'some/api'
            } as http.IncomingMessage, HttpStatusCode.OK, 'some');

            expect(mocksState.recordings['some'].length).toBe(2);
            expect(mocksState.recordings['some'][0]).toEqual(second);
            expect(mocksState.recordings['some'][1]).toEqual({
                data: 'chunk',
                payload: '{"x":"x"}',
                datetime: now.getTime(),
                method: 'GET',
                url: 'some/api',
                statusCode: 200
            } as HttpResponseRecording);
        });
    });

    afterAll(() => {
        httpRequestFn.restore();
        httpRequestFn.restore();
        recordFn.restore();
        clock.restore();
    });
});
