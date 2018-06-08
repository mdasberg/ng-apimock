import 'reflect-metadata';
import {Container} from 'inversify';
import * as fs from 'fs-extra';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as uuid from 'uuid';

import RecordResponseHandler from './record.response.handler';
import MocksState from '../../../state/mocks.state';
import Mock from '../../../domain/mock';
import {HttpMethods, HttpStatusCode} from '../../http';
import Recording from '../../../state/recording';

describe('RecordResponseHandler', () => {
    let body: string;
    let clock: sinon.SinonFakeTimers;
    let container: Container;
    let fetchResponseFn: sinon.SinonStub;
    let fsWriteFileSyncFn: sinon.SinonStub;
    let mocksState: MocksState;
    let nextFn: sinon.SinonStub;
    let mock: Mock;
    let now: Date;
    let recordFn: sinon.SinonStub;
    let recordResponseHandler: RecordResponseHandler;
    let request: http.IncomingMessage;
    let responseBufferFn: sinon.SinonStub;
    let responseHeadersGetFn: sinon.SinonStub;
    let responseHeadersRawFn: sinon.SinonStub;
    let response: http.ServerResponse;
    let responseEndFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;
    let uuidV4Fn: sinon.SinonStub;


    beforeAll(() => {
        body = '{"x":"x"}';
        container = new Container();
        mocksState = sinon.createStubInstance(MocksState);
        mock = {name: 'some'} as Mock;
        nextFn = sinon.stub();
        now = new Date();
        clock = sinon.useFakeTimers(now.getTime());
        request = sinon.createStubInstance(http.IncomingMessage);
        request.url = '/some/api';
        request.method = HttpMethods.GET;
        request.headers = {host: 'localhost:8888'};
        responseBufferFn = sinon.stub();
        responseHeadersRawFn = sinon.stub();
        responseHeadersGetFn = sinon.stub();
        response = sinon.createStubInstance(http.ServerResponse);
        responseWriteHeadFn = response.writeHead as sinon.SinonStub;
        responseEndFn = response.end as sinon.SinonStub;
        uuidV4Fn = sinon.stub(uuid, <any>'v4');
        fsWriteFileSyncFn = sinon.stub(fs, <any>'writeFileSync');

        container.bind<string>('BaseUrl').toConstantValue('baseUrl');
        container.bind<MocksState>('MocksState').toConstantValue(mocksState);
        container.bind<RecordResponseHandler>('RecordResponseHandler').to(RecordResponseHandler);

        mocksState = container.get<MocksState>('MocksState');
        recordResponseHandler = container.get<RecordResponseHandler>('RecordResponseHandler');

        recordFn = sinon.stub(RecordResponseHandler.prototype, <any>'record');
        fetchResponseFn = sinon.stub(RecordResponseHandler.prototype, <any>'fetchResponse');
    });

    describe('handle', () => {
        beforeEach(() => {
            responseBufferFn.returns('the-data');
            responseHeadersRawFn.returns({'Content-Type': 'application/pdf'});
        });

        describe('by default', () => {
            beforeEach(() => {
                fetchResponseFn.resolves({
                    buffer: responseBufferFn, headers: {raw: responseHeadersRawFn}, status: 200
                });
                recordResponseHandler.handle(request, response, nextFn, {mock: mock, body: body});
            });

            it('sets the record header to true', () =>
                expect(request.headers.record).toBe('true'));

            it('calls the api', () => {
                sinon.assert.calledWith(fetchResponseFn, sinon.match(async (actual: Request) => {
                    await expect(actual.url).toBe('http://localhost:8888/some/api');
                    await expect(actual.method).toBe(HttpMethods.GET);
                    await expect(actual.headers.get('host')).toBe('localhost:8888');
                    return await expect(actual.headers.get('record')).toBe('true');
                }));
            });

            afterEach(() => {
                fetchResponseFn.reset();
                recordFn.reset();
            });
        });

        describe('on successful api call', () => {
            beforeEach(() => {
                responseHeadersGetFn.returns('application/pdf');
                fetchResponseFn.resolves({
                    buffer: responseBufferFn, headers: {raw: responseHeadersRawFn, get: responseHeadersGetFn}, status: 200
                });
            });

            it('on request data record', async () => {
                await recordResponseHandler.handle(request, response, nextFn, {mock: mock, body: body});
                sinon.assert.calledWith(recordFn, 'some', sinon.match(async (actual: Recording) => {
                    await expect(actual.request.url).toBe('/some/api');
                    await expect(actual.request.method).toBe(HttpMethods.GET);
                    await expect(actual.request.headers).toEqual({host: 'localhost:8888', record: 'true'});
                    await expect(actual.request.body).toBe(JSON.stringify({x: 'x'}) as any);

                    await expect(actual.response.data).toBe('the-data');
                    await expect(actual.response.status).toBe(HttpStatusCode.OK);
                    await expect(actual.response.headers).toEqual({'Content-Type': 'application/pdf'});
                    return true;
                }));
            });

            it('returns the response', async () => {
                await recordResponseHandler.handle(request, response, nextFn, {mock: mock, body: body});
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, {'Content-Type': 'application/pdf'});
                sinon.assert.calledWith(responseEndFn, 'the-data');
            });

            afterEach(() => {
                fetchResponseFn.reset();
                recordFn.reset();
                responseEndFn.reset();
                responseWriteHeadFn.reset();
            });
        });

        describe('on unsuccessful api call', () => {
            let rejectedPromise: Promise<any>;
            beforeEach(() => {
                rejectedPromise = Promise.reject({message: 'oops'});
                fetchResponseFn.resolves(rejectedPromise);
            });

            it('returns the error response', async () => {
                try {
                    await recordResponseHandler.handle(request, response, nextFn, {mock: mock, body: body});
                    await rejectedPromise;
                } catch (err) {
                    sinon.assert.calledWith(responseEndFn, 'oops');
                }
            });

            afterEach(() => {
                fetchResponseFn.reset();
                recordFn.reset();
                responseEndFn.reset();
                responseWriteHeadFn.reset();
            });
        });
    });

    describe('record', () => {
        let recording: Recording;

        beforeEach(() => {
            mocksState.recordings = {};

            recording = {
                request: {
                    url: '/some/url',
                    method: HttpMethods.GET,
                    headers: {host: 'localhost:8888'},
                    body: {'some-key': 'some-value'}
                },
                response: {
                    data: 'the-data',
                    status: HttpStatusCode.OK,
                    headers: {'Content-Type': '...'},
                    contentType: '...'
                },
                datetime: new Date().getTime()
            };

            recordFn.callThrough();
            uuidV4Fn.returns('generated-uuid');
        });

        describe('applicable mimetype', () => {
            it('stores the recording', () => {
                recording.response.contentType = 'application/json';
                recordFn.callThrough();
                recordResponseHandler.record('identifier', recording);
                const actual = mocksState.recordings['identifier'][0];
                expect(actual.request.url).toBe('/some/url');
                expect(actual.request.method).toBe(HttpMethods.GET);
                expect(actual.request.headers).toEqual({host: 'localhost:8888'});
                expect(actual.request.body).toEqual({'some-key': 'some-value'});
                expect(actual.response.data).toBe('the-data');
                expect(actual.response.status).toEqual(HttpStatusCode.OK);
                expect(actual.response.headers).toEqual({'Content-Type': '...'});
            });
        });

        describe('non applicable mimetype', () => {
            it('stores the recording', () => {
                recording.response.contentType = 'application/pdf';
                recordFn.callThrough();
                recordResponseHandler.record('identifier', recording);
                const actual = mocksState.recordings['identifier'][0];
                expect(actual.request.url).toBe('/some/url');
                expect(actual.request.method).toBe(HttpMethods.GET);
                expect(actual.request.headers).toEqual({host: 'localhost:8888'});
                expect(actual.request.body).toEqual({'some-key': 'some-value'});
                // updates the data
                expect(actual.response.data).toBe('{"apimockFileLocation":"baseUrl/recordings/generated-uuid.pdf"}' );
                expect(actual.response.status).toEqual(HttpStatusCode.OK);
                expect(actual.response.headers).toEqual({'Content-Type': '...'});
            });

            it('saves the data', ()=> {
                sinon.assert.calledWith(fsWriteFileSyncFn, path.join(os.tmpdir(), 'generated-uuid.pdf'));
            });
        });
    });

    afterAll(() => {
        clock.restore();
        fsWriteFileSyncFn.restore();
        fetchResponseFn.restore();
        recordFn.restore();
        uuidV4Fn.restore();
    });
});
