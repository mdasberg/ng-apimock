import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import InitHandler from './init.handler';
import MocksState from '../../../state/mocks.state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('InitHandler', () => {
    const APIMOCK_ID = 'apimockId';
    const BASE_URL = '/base-url';

    let container: Container;
    let handler: InitHandler;
    let mocksState: MocksState;
    let nextFn: sinon.SinonStub;
    let request: http.IncomingMessage;
    let requestOnFn: sinon.SinonStub;
    let response: http.ServerResponse;
    let responseEndFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;

    beforeAll(() => {
        container = new Container();
        mocksState = sinon.createStubInstance(MocksState);
        nextFn = sinon.stub();
        request = sinon.createStubInstance(http.IncomingMessage);
        requestOnFn = request.on as sinon.SinonStub;
        response = sinon.createStubInstance(http.ServerResponse);
        responseEndFn = response.end as sinon.SinonStub;
        responseWriteHeadFn = response.writeHead as sinon.SinonStub;

        container.bind<string>('BaseUrl').toConstantValue(BASE_URL);
        container.bind<MocksState>('MocksState').toConstantValue(mocksState);
        container.bind<InitHandler>('InitHandler').to(InitHandler);

        handler = container.get<InitHandler>('InitHandler');
    });

    describe('handle', () =>
        it('ends the response', () => {
            handler.handle(request, response, nextFn, {id: APIMOCK_ID});
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
        }));

    describe('isApplicable', () => {
        it('indicates applicable when url and action match', () => {
            request.url = `${BASE_URL}/init`;
            request.method = HttpMethods.GET;
            expect(handler.isApplicable(request)).toBe(true);
        });
        it('indicates not applicable when the action does not match', () => {
            request.url = `${BASE_URL}/init`;
            request.method = HttpMethods.PUT;
            expect(handler.isApplicable(request)).toBe(false);
        });
        it('indicates not applicable when the url does not match', () => {
            request.url = `${BASE_URL}/no-match`;
            request.method = HttpMethods.GET;
            expect(handler.isApplicable(request)).toBe(false);
        });
    });
});