import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import DefaultsHandler from './handlers/api/defaults.handler';
import EchoRequestHandler from './handlers/mock/echo.request.handler';
import Mock from '../domain/mock';
import MockRequestHandler from './handlers/mock/mock.request.handler';
import MocksState from '../state/mocks.state';
import RecordResponseHandler from './handlers/mock/record.response.handler';
import UpdateMocksHandler from './handlers/api/update-mocks.handler';
import SetVariableHandler from './handlers/api/set-variable.handler';
import GetMocksHandler from './handlers/api/get-mocks.handler';
import GetVariablesHandler from './handlers/api/get-variables.handler';
import DeleteVariableHandler from './handlers/api/delete-variable.handler';
import PassThroughsHandler from './handlers/api/pass-throughs.handler';
import InitHandler from './handlers/api/init.handler';
import {ApplicableHandler} from './handlers/handler';
import GetRecordingsHandler from './handlers/api/get-recordings.handler';
import GetRecordedResponseHandler from './handlers/api/get-recorded-response.handler';

/** Middleware. */
@injectable()
class Middleware {
    private handlers: ApplicableHandler[];

    /**
     * Constructor
     * @param {DefaultsHandler} defaultsHandler The defaults handler.
     * @param {DeleteVariableHandler} deleteVariableHandler The delete variables handler.
     * @param {EchoRequestHandler} echoRequestHandler The echo request handler.
     * @param {GetMocksHandler} getMocksHandler The get mocks handler.
     * @param {GetVariablesHandler} getVariablesHandler The get variables handler.
     * @param {GetRecordingsHandler} getRecordingsHandler The get recordings handler.
     * @param {InitHandler} initHandler The init handler.
     * @param {MockRequestHandler} mockRequestHandler The mock request handler.
     * @param {MocksState} apimockState The apimock state.
     * @param {PassThroughsHandler} passThroughsHandler The pass throughs handler.
     * @param {RecordResponseHandler} recordResponseHandler The record response handler.
     * @param {SetVariableHandler} setVariableHandler The set variables handler.
     * @param {UpdateMocksHandler} updateMocksHandler The update mocks handler.
     */
    constructor(@inject('DefaultsHandler') private defaultsHandler: DefaultsHandler,
                @inject('DeleteVariableHandler') private deleteVariableHandler: DeleteVariableHandler,
                @inject('EchoRequestHandler') private echoRequestHandler: EchoRequestHandler,
                @inject('GetMocksHandler') private getMocksHandler: GetMocksHandler,
                @inject('GetRecordingsHandler') private getRecordingsHandler: GetRecordingsHandler,
                @inject('GetVariablesHandler') private getVariablesHandler: GetVariablesHandler,
                @inject('InitHandler') private initHandler: InitHandler,
                @inject('MockRequestHandler') private mockRequestHandler: MockRequestHandler,
                @inject('MocksState') private apimockState: MocksState,
                @inject('PassThroughsHandler') private passThroughsHandler: PassThroughsHandler,
                @inject('RecordResponseHandler') private recordResponseHandler: RecordResponseHandler,
                @inject('GetRecordedResponseHandler') private getRecordedResponseHandler: GetRecordedResponseHandler,
                @inject('SetVariableHandler') private setVariableHandler: SetVariableHandler,
                @inject('UpdateMocksHandler') private updateMocksHandler: UpdateMocksHandler) {
        this.handlers = [
            defaultsHandler,
            deleteVariableHandler,
            getMocksHandler,
            getRecordingsHandler,
            getVariablesHandler,
            initHandler,
            passThroughsHandler,
            getRecordedResponseHandler,
            setVariableHandler,
            updateMocksHandler
        ];
    }

    /**
     * Apimock Middleware.
     * @param {"http".IncomingMessage} request The request.
     * @param {"http".ServerResponse} response The response.
     * @param {Function} next The next callback function.
     */
    middleware(request: http.IncomingMessage, response: http.ServerResponse, next: Function): void {
        const apimockId: string = this.getApimockId(request.headers);
        const requestDataChunks: Buffer[] = [];
        request.on('data', (rawData: Buffer) => {
            requestDataChunks.push(rawData);
        }).on('end', () => {
            const body = requestDataChunks.length > 0 ? JSON.parse(Buffer.concat(requestDataChunks).toString()) : {};
            const handler = this.getMatchingApplicableHandler(request, body);
            if (handler !== undefined) {
                handler.handle(request, response, next, {id: apimockId, body: body});
            } else {
                const matchingMock: Mock = this.apimockState.getMatchingMock(request.url, request.method, request.headers, body);
                if (matchingMock !== undefined) {
                    // console.log("MATCHING MOCK", matchingMock)
                    this.echoRequestHandler.handle(request, response, next, {id: apimockId, mock: matchingMock, body: body});
                    if (this.apimockState.record && request.headers.record === undefined) {
                        this.recordResponseHandler.handle(request, response, next, {mock: matchingMock, body: body});
                    } else {
                        this.mockRequestHandler.handle(request, response, next, {id: apimockId, mock: matchingMock});
                    }
                } else {
                    next();
                }
            }
        });
    }

    /**
     * Get the applicable handler.
     * @param {"http".IncomingMessage} request The request.
     * @param body The body.
     * @return {ApplicableHandler} handler The applicable handler.
     */
    getMatchingApplicableHandler(request: http.IncomingMessage, body: any): ApplicableHandler {
        return this.handlers.find((handler: ApplicableHandler) => handler.isApplicable(request, body));
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
