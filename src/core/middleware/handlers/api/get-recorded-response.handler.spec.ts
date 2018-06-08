import 'reflect-metadata';
import {Container} from 'inversify';

import * as fs from 'fs-extra';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';

import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';
import GetRecordedResponseHandler from './get-recorded-response.handler';

describe('GetRecordedResponseHandler', () => {
    const BASE_URL = '/base-url';

    let container: Container;
    let fsReadFileSyncFn: sinon.SinonStub;
    let handler: GetRecordedResponseHandler;
    let nextFn: sinon.SinonStub;
    let request: http.IncomingMessage;
    let requestOnFn: sinon.SinonStub;
    let response: http.ServerResponse;
    let responseEndFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;

    beforeAll(() => {
        container = new Container();
        fsReadFileSyncFn = sinon.stub(fs, <any>'readFileSync');
        nextFn = sinon.stub();
        request = sinon.createStubInstance(http.IncomingMessage);
        request.url = 'some/url/to/some.pdf';
        requestOnFn = request.on as sinon.SinonStub;
        response = sinon.createStubInstance(http.ServerResponse);
        responseWriteHeadFn = response.writeHead as sinon.SinonStub;
        responseEndFn = response.end as sinon.SinonStub;

        container.bind<string>('BaseUrl').toConstantValue(BASE_URL);
        container.bind<GetRecordedResponseHandler>('GetRecordedResponseHandler').to(GetRecordedResponseHandler);

        handler = container.get<GetRecordedResponseHandler>('GetRecordedResponseHandler');
    });

    describe('handle', () =>
        it('returns the recorded response', () => {
            handler.handle(request, response, nextFn);

            sinon.assert.calledWith(fsReadFileSyncFn, path.join(os.tmpdir(), 'some.pdf'));
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_BINARY);
            sinon.assert.called(responseEndFn);
        }));

    describe('isApplicable', () => {
        it('indicates applicable when url and method match', () => {
            request.url = `${BASE_URL}/recordings/`;
            request.method = HttpMethods.GET;
            expect(handler.isApplicable(request)).toBe(true);
        });
        it('indicates not applicable when the method does not match', () => {
            request.url = `${BASE_URL}/recordings/`;
            request.method = HttpMethods.PUT;
            expect(handler.isApplicable(request)).toBe(false);
        });
        it('indicates not applicable when the url does not match', () => {
            request.url = `${BASE_URL}/no-match`;
            request.method = HttpMethods.GET;
            expect(handler.isApplicable(request)).toBe(false);
        });
    });

    afterAll(() => {
        fsReadFileSyncFn.restore();
    });
});