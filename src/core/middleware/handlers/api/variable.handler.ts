import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import Handler from '../handler';
import MocksState from '../../../state/mocks.state';
import State from '../../../state/state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

/**  Handler for a variables. */
@injectable()
class VariableHandler implements Handler {

    @inject('MocksState')
    mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: {
        id: string, payload: { [key: string]: string }
    }): void {
        const state = this.mocksState.getMatchingState(params.id);
        if (request.method === HttpMethods.GET) {
            this.handleGetVariables(response, state);
        } else if (request.method === HttpMethods.PUT) {
            this.handleSetVariable(response, state, params.payload);
        } else if (request.method === HttpMethods.DELETE) {
            this.handleDeleteVariable(response, state, request.url);
        }
    }

    /**
     * Gets the variables.
     * @param {"http".ServerResponse} response The http response.
     * @param {State} state The state.
     */
    handleGetVariables(response: http.ServerResponse, state: State): void {
        const result: any = {
            state: state.variables
        };
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(result));
    }

    /**
     * Sets the variable.
     * @param {"http".ServerResponse} response The http response.
     * @param {State} state The state.
     * @param {{[p: string]: string}} payload The payload.
     */
    handleSetVariable(response: http.ServerResponse, state: State, payload: { [key: string]: string }): void {
        try {
            if (Object.keys(payload).length > 0) {
                Object.keys(payload).forEach((key) => {
                    state.variables[key] = payload[key];
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

    /**
     * Deletes the variable.
     * @param {"http".ServerResponse} response The http response.
     * @param {State} state The state.
     * @param {string} url The url.
     */
    handleDeleteVariable(response: http.ServerResponse, state: State, url: string): void {
        const key = new RegExp('/ngapimock/variables/(.*)').exec(url)[1];
        delete state.variables[key];

        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end();
    }
}

export default VariableHandler;
