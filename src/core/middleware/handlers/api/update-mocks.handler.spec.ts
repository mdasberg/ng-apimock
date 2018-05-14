import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import UpdateMocksHandler from './update-mocks.handler';
import MocksState from '../../../state/mocks.state';
import State from '../../../state/state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('UpdateMocksHandler', () => {
    const APIMOCK_ID = 'apimockId';
    const BASE_URL = '/base-url';
    const DEFAULT_MOCKS_STATE = {
        'one': {scenario: 'some', delay: 0, echo: true},
        'two': {scenario: 'thing', delay: 1000, echo: false}
    };

    let container: Container;
    let handler: UpdateMocksHandler;
    let matchingState: State;
    let mocksState: MocksState;
    let mocksStateGetMatchingStateFn: sinon.SinonStub;
    let nextFn: sinon.SinonStub;
    let request: http.IncomingMessage;
    let requestOnFn: sinon.SinonStub;
    let response: http.ServerResponse;
    let responseEndFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;

    beforeAll(() => {
        container = new Container();
        mocksState = sinon.createStubInstance(MocksState);
        mocksStateGetMatchingStateFn = mocksState.getMatchingState as sinon.SinonStub;
        nextFn = sinon.stub();
        request = sinon.createStubInstance(http.IncomingMessage);
        requestOnFn = request.on as sinon.SinonStub;
        response = sinon.createStubInstance(http.ServerResponse);
        responseEndFn = response.end as sinon.SinonStub;
        responseWriteHeadFn = response.writeHead as sinon.SinonStub;

        container.bind<string>('BaseUrl').toConstantValue(BASE_URL);
        container.bind<MocksState>('MocksState').toConstantValue(mocksState);
        container.bind<UpdateMocksHandler>('UpdateMocksHandler').to(UpdateMocksHandler);

        handler = container.get<UpdateMocksHandler>('UpdateMocksHandler');
    });

    describe('handle', () => {
        beforeEach(() => {
            mocksState.mocks = [
                {
                    name: 'one',
                    request: {url: '/one', method: 'GET'},
                    responses: {'some': {}, 'thing': {}}
                },
                {
                    name: 'two',
                    request: {url: '/two', method: 'POST'},
                    responses: {'some': {}, 'thing': {}}
                }
            ];
            matchingState = {
                mocks: JSON.parse(JSON.stringify(DEFAULT_MOCKS_STATE)),
                variables: {}
            };
            mocksStateGetMatchingStateFn.returns(matchingState);
        });

        it('sets the echo', () => {
            const body = {name: 'two', echo: true};
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, body: body});

            expect(matchingState.mocks[body.name].echo).toBe(body.echo);
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
        });

        it('sets the delay', () => {
            const body = {name: 'two', delay: 1000};
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, body: body});

            expect(matchingState.mocks[body.name].delay).toBe(body.delay);
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
        });

        it('selects a mocks', () => {
            const body = {name: 'two', scenario: 'thing'};
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, body: body});

            expect(matchingState.mocks[body.name].scenario).toBe(body.scenario);
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
        });

        it('selects passThrough', () => {
            const body = {name: 'two', scenario: 'passThrough'};
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, body: body});

            expect(matchingState.mocks[body.name].scenario).toBe(body.scenario);
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
        });


        it('throw error if scenario does not exist', () => {
            const body = {name: 'two', scenario: 'non-existing'};
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, body: body});

            expect(matchingState.mocks[body.name].scenario).toBe((DEFAULT_MOCKS_STATE as any)[body.name].scenario);
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.calledWith(responseEndFn, `{"message":"No scenario matching ['${body.scenario}'] found"}`);
        });

        it('throw error if mock does not exist', () => {
            const body = {name: 'non-existing', scenario: 'non-existing'};
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, body: body});

            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.calledWith(responseEndFn, `{"message":"No mock matching name ['${body.name}'] found"}`);
        });

        afterEach(() => {
            responseWriteHeadFn.reset();
            responseEndFn.reset();
        });
    });

    describe('isApplicable', () => {
        it('indicates applicable when url and action match', () => {
            request.url = `${BASE_URL}/mocks`;
            request.method = HttpMethods.PUT;
            expect(handler.isApplicable(request)).toBe(true);
        });
        it('indicates not applicable when the action does not match', () => {
            request.url = `${BASE_URL}/mocks`;
            request.method = HttpMethods.GET;
            expect(handler.isApplicable(request)).toBe(false);
        });
        it('indicates not applicable when the url does not match', () => {
            request.url = `${BASE_URL}/no-match`;
            request.method = HttpMethods.PUT;
            expect(handler.isApplicable(request)).toBe(false);
        });
    });
});