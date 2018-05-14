import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import MocksState from '../../../state/mocks.state';
import {ApplicableHandler} from '../handler';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

/**  Get recordings handler. */
@injectable()
class GetRecordingsHandler implements ApplicableHandler {
    /**
     * Constructor.
     * @param {MocksState} mocksState The mocks state.
     * @param {string} baseUrl The base url.
     */
    constructor(@inject('MocksState') private mocksState: MocksState,
                @inject('BaseUrl') private baseUrl: string) {
    }

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: { id: string }): void {
        const result: any = {
            recordings: this.mocksState.recordings
        };
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(result));
    }

    /** {@inheritDoc}.*/
    isApplicable(request: http.IncomingMessage): boolean {
        const urlMatches = request.url.startsWith(`${this.baseUrl}/recordings`);
        const methodMatches = request.method === HttpMethods.GET;
        return urlMatches && methodMatches;
    }
}

export default GetRecordingsHandler;
