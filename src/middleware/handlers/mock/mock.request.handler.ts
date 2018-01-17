import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as fs from 'fs-extra';
import * as http from 'http';
import * as url from 'url';
import {HttpHeaders, HttpStatusCode} from '../../http';

import Handler from '../handler';
import MocksState from '../../../state/mocks.state';
import Mock from '../../../domain/mock';
import MockResponse from '../../../domain/mock.response';

/**  Handler for a mock request. */
@injectable()
class MockRequestHandler implements Handler {
    @inject('MocksState')
    private mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, id: string, mock: Mock): void {
        const _response: MockResponse = this.mocksState.getResponse(mock.name, id);
        const _variables: any = this.mocksState.getVariables(id);

        if (_response !== undefined) {
            const status: number = _response.status || HttpStatusCode.OK;
            const delay: number = this.mocksState.getDelay(mock.name, id);
            const jsonCallbackName = this.getJsonCallbackName(request);

            let headers: { [key: string]: string };
            let chunk: Buffer | string;

            if (this._isBinaryResponse(_response)) {
                headers = _response.headers || HttpHeaders.CONTENT_TYPE_BINARY;
                chunk = fs.readFileSync(_response.file);
            } else {
                headers = _response.headers || HttpHeaders.CONTENT_TYPE_APPLICATION_JSON;
                chunk = this.interpolateResponseData(_response.data, _variables, (mock.isArray ? [] : {}));
            }

            if (jsonCallbackName !== false) {
                chunk = jsonCallbackName + '(' + chunk + ')';
            }

            setTimeout(() => {
                response.writeHead(status, headers);
                response.end(chunk);
            }, delay);
        } else {
            next();
        }
    }

    /**
     * Indicates if the given response is a binary response.
     * @param response The response
     * @return {boolean} indicator The indicator.
     */
    private _isBinaryResponse(response: MockResponse): boolean {
        return response.file !== undefined;
    }

    /**
     * Update the response data with the globally available variables.
     * @param data The data.
     * @param variables The variables.
     * @param defaults The defaults.
     * @return updatedData The updated data.
     */
    private interpolateResponseData(data: any, variables: { [key: string]: string }, defaults: any): string {
        let _data: string;

        if (data !== undefined) {
            _data = JSON.stringify(data);
            Object.keys(variables).forEach((key) => {
                if (variables.hasOwnProperty(key)) {
                    _data = _data.replace(new RegExp('%%' + key + '%%', 'g'), variables[key]);
                }
            });
        } else {
            _data = JSON.stringify(defaults);
        }
        return _data;
    }

    /**
     * Get the JSONP callback name.
     * @param request The request.
     * @returns {string|boolean} callbackName Either the name or false.
     */
    private getJsonCallbackName(request: http.IncomingMessage): string | boolean {
        const parsedUrl: any = url.parse(request.url, true);
        return !parsedUrl.query || !parsedUrl.query.callback ? false : parsedUrl.query.callback;
    }
}

export default MockRequestHandler;
