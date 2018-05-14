import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import GetRecordingsHandler from './get-recordings.handler';
import MocksState from '../../../state/mocks.state';
import State from '../../../state/state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('GetRecordingsHandler', () => {
    const APIMOCK_ID = 'apimockId';
    const BASE_URL = '/base-url';
    const DEFAULT_MOCKS_STATE = {
        'one': {scenario: 'some', delay: 0, echo: true},
        'two': {scenario: 'thing', delay: 1000, echo: false}
    };

    let container: Container;
    let handler: GetRecordingsHandler;
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
        container.bind<GetRecordingsHandler>('GetRecordingsHandler').to(GetRecordingsHandler);

        handler = container.get<GetRecordingsHandler>('GetRecordingsHandler');
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

        it('gets the mocks', () => {
            handler.handle(request, response, nextFn, {id: APIMOCK_ID});
            sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            sinon.assert.calledWith(responseEndFn, JSON.stringify({
                recordings: mocksState.recordings,
            }));
        });

        afterEach(() => {
            responseWriteHeadFn.reset();
            responseEndFn.reset();
        });
    });

    describe('isApplicable', () => {
        it('indicates applicable when url and method match', () => {
            request.url = `${BASE_URL}/recordings`;
            request.method = HttpMethods.GET;
            expect(handler.isApplicable(request)).toBe(true);
        });
        it('indicates not applicable when the method does not match', () => {
            request.url = `${BASE_URL}/recordings`;
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