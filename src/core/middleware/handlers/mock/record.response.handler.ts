import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as fs from 'fs-extra';
import fetch, {Request} from 'node-fetch';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import * as uuid from 'uuid';

import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';
import {Handler} from '../handler';
import Recording from '../../../state/recording';
import {HttpMethods} from '../../http';


/**  Handler for a recording a response. */
@injectable()
class RecordResponseHandler implements Handler {
    APPLICABLE_MIMETYPES = ['application/json', 'application/xml'];
    RESPONSE_ENCODING = 'base64';

    /**
     * Constructor.
     * @param {MocksState} mocksState The mocks state.
     */
    constructor(@inject('BaseUrl') private baseUrl: string,
                @inject('MocksState') private mocksState: MocksState) {
    }

    /** {@inheritDoc}.*/
    async handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: { mock: Mock, body: any }): Promise<any> {
        const method = request.method;
        const headers = request.headers;

        headers.record = 'true';

        const requestInit: any = {
            method: method,
            headers: headers as HeadersInit
        };

        if ([HttpMethods.GET, HttpMethods.DELETE].indexOf(request.method) === -1) {
            requestInit.body = JSON.stringify(params.body);
        }

        try {
            const res = await this.fetchResponse(new Request(`http://${headers.host}${request.url}`, requestInit));
            const responseData = await res.buffer();
            const responseHeaders = await res.headers.raw();
            const responseStatusCode = res.status;

            const recording: any = {
                request: {
                    url: request.url,
                    method: request.method,
                    headers: request.headers,
                    body: params.body
                },
                response: {
                    data: responseData.toString(this.RESPONSE_ENCODING),
                    status: responseStatusCode,
                    headers: responseHeaders,
                    contentType: res.headers.get('content-type')
                },
                datetime: new Date().getTime()
            };

            this.record(params.mock.name, recording);

            response.writeHead(responseStatusCode, responseHeaders);
            response.end(responseData);
        } catch(err) {
            response.end(err.message);
        }
    }

    /**
     * Fetch the request.
     * @param {Request} request The request.
     * @return {Promise<any>} promise The promise.
     */
    fetchResponse(request: Request): Promise<any> {
        return fetch(request);
    }

    /**
     * Stores the recording with the matching mock.
     * @param {string} identifier The identifier.
     * @param {Recording} recording The recordings.
     */
    record(identifier: string, recording: Recording) {
        const contentType: string = recording.response.contentType;
        if (this.mocksState.recordings[identifier] === undefined) {
            this.mocksState.recordings[identifier] = [];
        }

        if (this.APPLICABLE_MIMETYPES.indexOf(contentType) === -1) {
            const destination = `${uuid.v4()}.${contentType.substring(contentType.indexOf('/') + 1)}`;
            fs.writeFileSync(path.join(os.tmpdir(), destination), new Buffer(recording.response.data, 'base64'));
            recording.response.data = JSON.stringify({apimockFileLocation: `${this.baseUrl}/recordings/${destination}`});
        }
        this.mocksState.recordings[identifier].push(recording);
    }
}

export default RecordResponseHandler;
