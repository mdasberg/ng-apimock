import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';
import {Handler} from '../handler';
import {HttpMethods} from '../../http';
import Recording from '../../../state/recording';

/**  Handler for a recording a response. */
@injectable()
class RecordResponseHandler implements Handler {
    RESPONSE_ENCODING = 'utf8';
    MAX_RECORDINGS_PER_MOCK = 2;
    fetch: any;

    /**
     * Constructor.
     * @param {MocksState} mocksState The mocks state.
     */
    constructor(@inject('MocksState') private mocksState: MocksState) {
        this.fetch = require('node-fetch');
    }

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: { mock: Mock, body: any }): void {
        const method = request.method;
        const headers = request.headers;

        headers.record = 'true';

        const requestInit: RequestInit = {
            method: method,
            headers: headers as HeadersInit
        };

        if ([HttpMethods.GET, HttpMethods.DELETE].indexOf(request.method) === -1) {
            requestInit.body = JSON.stringify(params.body);
        }

        this.fetch(`http://${headers.host}${request.url}`, requestInit)
            .then(async (res: any) => {
                const responseData = await res.buffer();
                const responseHeaders = await res.headers.raw();
                const responseStatusCode = res.status;
                const recording: Recording = {
                    request: {
                        url: request.url,
                        method: request.method,
                        headers: request.headers,
                        body: params.body
                    },
                    response: {
                        data: responseData.toString(this.RESPONSE_ENCODING),
                        status: responseStatusCode,
                        headers: responseHeaders
                    },
                    datetime: new Date().getTime()
                };

                this.record(params.mock.name, recording);

                response.writeHead(responseStatusCode, responseHeaders);
                response.end(responseData);
            })
            .catch((res: any) => response.end(res.message));
    }

    /**
     * Stores the recording with the matching mock.
     * Recording are limited to the MAX_RECORDINGS_PER_MOCK.
     * When the maximum number is reached, the oldest recording is removed.
     * @param {object} body The body.
     * @param {string | Buffer} chunk The chunk.
     * @param {"http".IncomingMessage} request The http request.
     * @param {number} status The status code.
     * @param {string} identifier The identifier.
     */
    record(identifier: string, recording: Recording) {
        if (this.mocksState.recordings[identifier] === undefined) {
            this.mocksState.recordings[identifier] = [];
        } else if (this.mocksState.recordings[identifier].length > (this.MAX_RECORDINGS_PER_MOCK - 1)) {
            this.mocksState.recordings[identifier].shift();
        }
        this.mocksState.recordings[identifier].push(recording);
    }
}

export default RecordResponseHandler;
