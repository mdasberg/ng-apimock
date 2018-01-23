import 'reflect-metadata';
import {Container} from 'inversify';

import * as http from 'http';
import * as sinon from 'sinon';

import EchoRequestHandler from './echo.request.handler';
import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';
import {HttpMethods} from '../../http';

describe('EchoRequestHandler', () => {
    let echoRequestHandler: EchoRequestHandler;
    let mocksState: MocksState;

    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let mockStateGetEchoFn: sinon.SinonStub;
    let consoleLogFn: sinon.SinonStub;

    let container: Container;

    const APIMOCK_ID = 'apimockId';

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();
        container.bind<EchoRequestHandler>('EchoRequestHandler').to(EchoRequestHandler);

        nextFn = sinon.stub();
        requestOnFn = sinon.stub();

        mocksState = container.get<MocksState>('MocksState');
        echoRequestHandler = container.get<EchoRequestHandler>('EchoRequestHandler');

        mockStateGetEchoFn = sinon.stub(MocksState.prototype, 'getEcho');
        consoleLogFn = sinon.stub(console, 'log');

    });

    describe('handle', () => {
        let request: any;
        let response: http.ServerResponse;
        let mock: Mock;
        let payload: any;

        beforeEach(() => {
            request = {
                url: '/ngapimock/mocks',
                on: requestOnFn
            };
            response = {} as http.ServerResponse;
            mock = {
                name: 'some',
                request: {
                    method: HttpMethods.GET,
                    url: '/some/url',
                }
            } as Mock;
            payload = {'x': 'x'};
        });
        describe('echo = true', () =>
            it('console.logs the request', () => {
                mockStateGetEchoFn.returns(true);

                echoRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: mock, payload: payload});
                sinon.assert.calledWith(mockStateGetEchoFn, mock.name, APIMOCK_ID);
                sinon.assert.calledWith(consoleLogFn, `${mock.request.method} request made on \'${mock.request.url}\' with payload: \'${JSON.stringify(payload)}`);
            })
        );

        describe('echo = false', () =>
            it('does not console.logs the request', () => {
                mockStateGetEchoFn.returns(false);

                echoRequestHandler.handle(request, response, nextFn, {id: APIMOCK_ID, mock: mock, payload: payload});
                sinon.assert.calledWith(mockStateGetEchoFn, mock.name, APIMOCK_ID);
                sinon.assert.notCalled(consoleLogFn);
            })
        );

        afterEach(() => {
            mockStateGetEchoFn.reset();
            nextFn.reset();
            consoleLogFn.reset();
        });
    });

    afterAll(() => {
        mockStateGetEchoFn.restore();
        consoleLogFn.restore();
    });
});
