import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import MocksState from '../../../state/mocks.state';
import {ApplicableHandler} from '../handler';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

/**  Handler for a variables. */
@injectable()
class SetVariableHandler implements ApplicableHandler {
    /**
     * Constructor.
     * @param {MocksState} mocksState The mocks state.
     * @param {string} baseUrl The base url.
     */
    constructor(@inject('MocksState') private mocksState: MocksState,
                @inject('BaseUrl') private baseUrl: string) {
    }

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: {
        id: string, body: { [key: string]: string }
    }): void {
        const state = this.mocksState.getMatchingState(params.id);
        const body = params.body;
        try {
            if (Object.keys(body).length > 0) {
                Object.keys(body).forEach((key) => {
                    state.variables[key] = body[key];
                });
            } else {
                throw new Error('A variable should have a key and value');
            }
            response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            response.end();
        } catch (e) {
            response.writeHead(HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            response.end(JSON.stringify(e, ['message']));
        }
    }

    /** {@inheritDoc}.*/
    isApplicable(request: http.IncomingMessage): boolean {
        const methodMatches = request.method === HttpMethods.PUT;
        const urlMatches = request.url.startsWith(`${this.baseUrl}/variables`);
        return urlMatches && methodMatches;
    }
}

export default SetVariableHandler;
