import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import ActionHandler from './handlers/api/action.handler';
import EchoRequestHandler from './handlers/mock/echo.request.handler';
import {HttpMethods} from './http';
import Mock from '../domain/mock';
import MockRequestHandler from './handlers/mock/mock.request.handler';
import MocksState from '../state/mocks.state';
import RecordResponseHandler from './handlers/mock/record.response.handler';
import ScenarioHandler from './handlers/api/scenario.handler';

/** Middleware. */
@injectable()
class Middleware {

    @inject('MockRequestHandler')
    private mockRequestHander: MockRequestHandler;

    @inject('EchoRequestHandler')
    private echoRequestHandler: EchoRequestHandler;

    @inject('RecordResponseHandler')
    private recordResponseHandler: RecordResponseHandler;

    @inject('ScenarioHandler')
    private scenarioHandler: ScenarioHandler;

    @inject('ActionHandler')
    private actionHandler: ActionHandler;

    @inject('MocksState')
    private apimockState: MocksState;

    /**
     * Apimock Middleware.
     * @param {"http".IncomingMessage} request The request.
     * @param {"http".ServerResponse} response The response.
     * @param {Function} next The next callback function.
     */
    middleware(request: http.IncomingMessage, response: http.ServerResponse, next: Function): void {
        const apimockId: string = this.getApimockId(request.headers);

        if (request.url.startsWith('/ngapimock/mocks')) {
            this.scenarioHandler.handle(request, response, next, {id: apimockId});
        } else if (request.url.startsWith('/ngapimock/actions') && request.method === HttpMethods.PUT) {
            this.actionHandler.handle(request, response, next, {id: apimockId});
        } else {
            const requestDataChunks: Buffer[] = [];

            request.on('data', (rawData: Buffer) => {
                requestDataChunks.push(rawData);
            }).on('end', () => {
                const payload = requestDataChunks.length > 0 ? JSON.parse(Buffer.concat(requestDataChunks).toString()) : {};
                const matchingMock: Mock = this.apimockState.getMatchingMock(request.url, request.method, request.headers, payload);
                if (matchingMock !== undefined) {
                    this.echoRequestHandler.handle(request, response, next, {id: apimockId, mock: matchingMock, payload: payload});
                    if (this.apimockState.record && !request.headers.record) {
                        this.recordResponseHandler.handle(request, response, next, {mock: matchingMock});
                    } else {
                        this.mockRequestHander.handle(request, response, next, {id: apimockId, mock: matchingMock});
                    }
                } else {
                    next();
                }
            });
        }
    }

    /**
     * Get the apimockId from the given cookies.
     * @param headers The headers.
     * @returns {string} id The apimock id.
     */
    getApimockId(headers: http.IncomingHttpHeaders): string {
        const result = headers.cookie && (headers.cookie as string)
            .split(';')
            .map(cookie => {
                const parts = cookie.split('=');
                return {
                    key: parts.shift().trim(),
                    value: decodeURI(parts.join('='))
                };
            })
            .find(cookie => cookie.key === 'apimockid');

        return result !== undefined ? result.value : undefined;
    }
}

export default Middleware;
