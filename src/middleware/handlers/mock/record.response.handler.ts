import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import Handler from '../handler';
import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';

/**  Handler for a recording a response. */
@injectable()
class RecordResponseHandler implements Handler {
    RESPONSE_ENCODING = 'utf8';
    MAX_RECORDINGS_PER_MOCK = 2;

    @inject('MocksState')
    private mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: { mock: Mock }): void {
        const requestDataChunks: Buffer[] = [];

        request.on('data', (rawData: Buffer) => {
            requestDataChunks.push(rawData);
        });

        request.on('end', () => {
            const payload: string = Buffer.concat(requestDataChunks).toString();
            const headers: http.IncomingHttpHeaders = request.headers;
            const host: string = headers.host;
            const options = {
                host: host.split(':')[0],
                port: Number(host.split(':')[1]),
                path: request.url,
                method: request.method,
                headers: headers
            };

            headers.record = 'off';

            const _request: http.ClientRequest = http.request(options, (_response: http.IncomingMessage) => {
                _response.setEncoding(this.RESPONSE_ENCODING);
                _response.on('data', (chunk: Buffer) => {
                    this.record(payload, chunk.toString(this.RESPONSE_ENCODING), request, _response.statusCode,
                        params.mock.name);
                    response.end(chunk);
                });
            });

            _request.on('error', function (e) {
                response.end(e);
            });

            _request.end();
        });
    }

    /**
     * Stores the recording with the matching mock.
     * Recording are limited to the MAX_RECORDINGS_PER_MOCK.
     * When the maximum number is reached, the oldest recording is removed.
     * @param payload The payload.
     * @param chunk The chunk.
     * @param request The http request.
     * @param statusCode The status code.
     * @param identifier The identifier.
     */
    private record(payload: string, chunk: string | Buffer, request: http.IncomingMessage, statusCode: number,
                   identifier: string) {
        const result = {
            data: typeof chunk === 'string' ? chunk : chunk.toString(this.RESPONSE_ENCODING),
            payload: payload,
            datetime: new Date().getTime(),
            method: request.method,
            url: request.url,
            statusCode: statusCode
        };

        if (this.mocksState.recordings[identifier] === undefined) {
            this.mocksState.recordings[identifier] = [];
        } else if (this.mocksState.recordings[identifier].length > (this.MAX_RECORDINGS_PER_MOCK - 1)) {
            this.mocksState.recordings[identifier].shift();
        }
        this.mocksState.recordings[identifier].push(result);
    }
}

export default RecordResponseHandler;
