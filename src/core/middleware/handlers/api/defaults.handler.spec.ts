import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import DefaultsHandler from './defaults.handler';
import MocksState from '../../../state/mocks.state';
import {HttpHeaders, HttpStatusCode} from '../../http';

describe('DefaultsHandler', () => {
    const APIMOCK_ID = 'apimockId';
    const BASE_URL = '/base-url';

    let container: Container;
    let handler: DefaultsHandler;
    let mocksState: MocksState;
    let mocksStateSetToDefaultsFn: sinon.SinonStub;
    let nextFn: sinon.SinonStub;
    let request: http.IncomingMessage;
    let requestOnFn: sinon.SinonStub;
    let response: http.ServerResponse;
    let responseEndFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;

    beforeAll(() => {
        container = new Container();
        mocksState = sinon.createStubInstance(MocksState);
        mocksStateSetToDefaultsFn = mocksState.setToDefaults as sinon.SinonStub;
        nextFn = sinon.stub();
        request = sinon.createStubInstance(http.IncomingMessage);
        requestOnFn = request.on as sinon.SinonStub;
        response = sinon.createStubInstance(http.ServerResponse);
        responseWriteHeadFn = response.writeHead as sinon.SinonStub;
        responseEndFn = response.end as sinon.SinonStub;

        container.bind<string>('BaseUrl').toConstantValue(BASE_URL);
        container.bind<MocksState>('MocksState').toConstantValue(mocksState);
        container.bind<DefaultsHandler>('ActionHandler').to(DefaultsHandler);

        handler = container.get<DefaultsHandler>('ActionHandler');
    });

    describe('handle', () =>
        it('sets the defaults', () => {
            handler.handle(request, response, nextFn, {id: APIMOCK_ID});

            sinon.assert.calledWith(mocksStateSetToDefaultsFn, APIMOCK_ID);
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
        }));

    describe('isApplicable', () => {
        it('indicates applicable when url and action match', () => {
            request.url = `${BASE_URL}/actions`;
            expect(handler.isApplicable(request, {action: 'defaults'})).toBe(true);
        });
        it('indicates not applicable when the action does not match', () => {
            request.url = `${BASE_URL}/actions`;
            expect(handler.isApplicable(request, {action: 'NO-MATCHING-ACTION'})).toBe(false);
        });
        it('indicates not applicable when the url does not match', () => {
            request.url = `${BASE_URL}/no-match`;
            expect(handler.isApplicable(request, {action: 'defaults'})).toBe(false);
        });
    });
});