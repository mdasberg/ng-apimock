import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import MocksState from '../../../state/mocks.state';
import SetVariableHandler from './set-variable.handler';
import State from '../../../state/state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('SetVariableHandler', () => {
    const APIMOCK_ID = 'apimockId';
    const BASE_URL = '/base-url';
    const DEFAULT_VARIABLES_STATE = {
        'one': 'first',
        'two': 'second',
        'three': 'third'
    };

    let container: Container;
    let handler: SetVariableHandler;
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
        responseWriteHeadFn = response.writeHead as sinon.SinonStub;
        responseEndFn = response.end as sinon.SinonStub;

        container.bind<string>('BaseUrl').toConstantValue(BASE_URL);
        container.bind<MocksState>('MocksState').toConstantValue(mocksState);
        container.bind<SetVariableHandler>('SetVariableHandler').to(SetVariableHandler);

        handler = container.get<SetVariableHandler>('SetVariableHandler');
    });

    describe('handle', () => {
        beforeEach(() => {
            request.method = HttpMethods.PUT;
            matchingState = {
                mocks: {},
                variables: JSON.parse(JSON.stringify(DEFAULT_VARIABLES_STATE)),
            };
            mocksStateGetMatchingStateFn.returns(matchingState);
        });

        it('sets the variable', () => {
            const payload = {'four': 'fourth'} as any;
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
            expect(matchingState.variables['four']).toBe('fourth');
        });

        it('sets the variables', () => {
            const payload = {'five': 'fifth', 'six': 'sixth'} as any;
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
            expect(matchingState.variables['five']).toBe('fifth');
            expect(matchingState.variables['six']).toBe('sixth');
        });

        it('throw error if no key value pair is present', () => {
            const payload = {} as any;
            handler.handle(request, response, nextFn, {id: APIMOCK_ID, payload: payload});
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.calledWith(responseEndFn, `{"message":"A variable should have a key and value"}`);
        });

        afterEach(() => {
            mocksStateGetMatchingStateFn.reset();
            responseWriteHeadFn.reset();
            responseEndFn.reset();
        });
    });

    describe('isApplicable', () => {
        it('indicates applicable when url and action match', () => {
            request.url = `${BASE_URL}/variables`;
            request.method = HttpMethods.PUT;
            expect(handler.isApplicable(request)).toBe(true);
        });
        it('indicates not applicable when the action does not match', () => {
            request.url = `${BASE_URL}/variables`;
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