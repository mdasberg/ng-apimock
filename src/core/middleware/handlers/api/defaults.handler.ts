import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';
import {HttpHeaders, HttpStatusCode} from '../../http';

import MocksState from '../../../state/mocks.state';
import {ApplicableHandler} from '../handler';

/**  Defaults handler. */
@injectable()
class DefaultsHandler implements ApplicableHandler {
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
        this.mocksState.setToDefaults(params.id);
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end();
    }

    /** {@inheritDoc}.*/
    isApplicable(request: http.IncomingMessage, body: any): boolean {
        const urlMatches = request.url.startsWith(`${this.baseUrl}/actions`);
        const actionMatches = body !== undefined && body.action === 'defaults';
        return urlMatches && actionMatches;
    }
}

export default DefaultsHandler;
