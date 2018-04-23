import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import GetVariablesHandler from './get-variables.handler';
import MocksState from '../../../state/mocks.state';
import State from '../../../state/state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('GetVariablesHandler', () => {
    const APIMOCK_ID = 'apimockId';
    const BASE_URL = '/base-url';
    const DEFAULT_VARIABLES_STATE = {
        'one': 'first',
        'two': 'second',
        'three': 'third'
    };

    let container: Container;
    let handler: GetVariablesHandler;
    let matchingState: State;
    let mocksState: MocksState;
    let mocksStateGetMatchingStateFn: sinon.SinonStub;
    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let request: http.IncomingMessage;
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
        container.bind<GetVariablesHandler>('GetVariablesHandler').to(GetVariablesHandler);

        handler = container.get<GetVariablesHandler>('GetVariablesHandler');
    });

    describe('handle', () => {
        beforeEach(() => {
            request.url = `${BASE_URL}/variables`;
            matchingState = {
                mocks: {},
                variables: JSON.parse(JSON.stringify(DEFAULT_VARIABLES_STATE))
            };
            mocksStateGetMatchingStateFn.returns(matchingState);
        });

        it('gets the variables', () => {
            handler.handle(request, response, nextFn, {id: APIMOCK_ID});
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.called(responseEndFn);
            expect(Object.keys(matchingState.variables).length).toBe(3);
        });

        afterEach(() => {
            responseWriteHeadFn.reset();
            responseEndFn.reset();
        });
    });

    describe('isApplicable', () => {
        it('indicates applicable when url and method match', () => {
            request.url = `${BASE_URL}/variables`;
            request.method = HttpMethods.GET;
            expect(handler.isApplicable(request)).toBe(true);
        });
        it('indicates not applicable when the method does not match', () => {
            request.url = `${BASE_URL}/variables`;
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