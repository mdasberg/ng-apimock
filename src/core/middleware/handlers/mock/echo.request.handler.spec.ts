import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import EchoRequestHandler from './echo.request.handler';
import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';
import {HttpMethods} from '../../http';

describe('EchoRequestHandler', () => {
    const APIMOCK_ID = 'apimockId';
    const BODY = {x: 'x'};
    const MOCK = {
        name: 'some',
        request: {
            method: HttpMethods.GET,
            url: '/some/url',
        }
    } as Mock;

    let container: Container;
    let consoleLogFn: sinon.SinonStub;
    let echoRequestHandler: EchoRequestHandler;
    let mocksState: MocksState;
    let mocksStateGetEchoFn: sinon.SinonStub;
    let nextFn: sinon.SinonStub;
    let request: http.IncomingMessage;
    let requestOnFn: sinon.SinonStub;
    let response: http.ServerResponse;

    beforeAll(() => {
        consoleLogFn = sinon.stub(console, <any>'log');
        container = new Container();
        mocksState = sinon.createStubInstance(MocksState);
        mocksStateGetEchoFn = mocksState.getEcho as sinon.SinonStub;
        nextFn = sinon.stub();
        request = sinon.createStubInstance(http.IncomingMessage);
        requestOnFn = request.on as sinon.SinonStub;
        response = sinon.createStubInstance(http.ServerResponse);

        container.bind<EchoRequestHandler>('EchoRequestHandler').to(EchoRequestHandler);
        container.bind<MocksState>('MocksState').toConstantValue(mocksState);

        echoRequestHandler = container.get<EchoRequestHandler>('EchoRequestHandler');
    });

    describe('handle', () => {
        describe('echo = true', () =>
            it('console.logs the request', () => {
                mocksStateGetEchoFn.returns(true);

                echoRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: MOCK, body: BODY});
                sinon.assert.calledWith(mocksStateGetEchoFn, MOCK.name, APIMOCK_ID);
                sinon.assert.calledWith(consoleLogFn, `${MOCK.request.method} request made on \'${MOCK.request.url}\' with body: \'${JSON.stringify(BODY)}`);
            })
        );

        describe('echo = false', () =>
            it('does not console.logs the request', () => {
                mocksStateGetEchoFn.returns(false);

                echoRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: MOCK, body: BODY});
                sinon.assert.calledWith(mocksStateGetEchoFn, MOCK.name, APIMOCK_ID);
                sinon.assert.notCalled(consoleLogFn);
            })
        );

        afterEach(() => {
            mocksStateGetEchoFn.reset();
            nextFn.reset();
            consoleLogFn.reset();
        });
    });

    afterAll(() => {
        consoleLogFn.restore();
    });
});
