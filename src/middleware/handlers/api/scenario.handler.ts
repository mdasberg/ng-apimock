import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

import Handler from '../handler';
import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';
import State from '../../../state/state';

/**  Handler for a scenarios. */
@injectable()
class ScenarioHandler implements Handler {
    private PASS_THROUGH = 'passThrough';

    @inject('MocksState')
    private mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: {
        id: string, payload: { name: string, scenario: string, echo: boolean, delay: number }
    }): void {
        if (request.method === HttpMethods.GET) {
            this.handleGetMocks(response, params.id);
        } else if (request.method === HttpMethods.PUT) {
            this.handleSelectMockScenario(request, response, params.id, params.payload);
        }
    }

    /**
     * Gets the mocks.
     * @param {"http".ServerResponse} response The http response.
     * @param {string} id The apimock id.
     */
    handleGetMocks(response: http.ServerResponse, id: string): void {
        const state: any = {
            state: this.mocksState.getMatchingState(id),
            recordings: this.mocksState.recordings,
            record: this.mocksState.record,
            defaults: this.mocksState.defaults,
            mocks: this.mocksState.mocks.map((mock) => ({
                name: mock.name,
                isArray: mock.isArray ? [] : {},
                request: mock.request,
                responses: Object.keys(mock.responses)
            }))
        };
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(state));
    }

    /**
     * Select the scenario.
     * @param {"http".IncomingMessage} request The http request.
     * @param {"http".ServerResponse} response The http response.
     * @param {string} id The apimock id.
     */
    handleSelectMockScenario(request: http.IncomingMessage, response: http.ServerResponse, id: string, payload: {
        name: string, scenario: string, echo: boolean, delay: number
    }): void {
        try {
            const mockName: string = payload.name;
            const matchingMock: Mock = this.mocksState.mocks.find((mock) => mock.name === mockName);
            const matchingState: State = this.mocksState.getMatchingState(id);

            if (matchingMock !== undefined) {
                const scenario: string = payload.scenario;
                const echo: boolean = payload.echo;
                const delay: number = payload.delay;

                if (scenario !== undefined) {
                    if (scenario === this.PASS_THROUGH ||
                        Object.keys(matchingMock.responses).find((_scenario) => _scenario === scenario)) {
                        matchingState.mocks[mockName].scenario = scenario;
                    } else {
                        throw new Error(`No scenario matching [${scenario}] found`);
                    }
                }
                if (echo !== undefined) {
                    matchingState.mocks[mockName].echo = echo;
                }
                if (delay !== undefined) {
                    matchingState.mocks[mockName].delay = delay;
                }

            } else {
                throw new Error(`No mock matching name ['${mockName}'] found`);
            }
            response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            response.end();
        } catch (e) {
            response.writeHead(HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            response.end(JSON.stringify(e, ['message']));
        }
    }
}

export default ScenarioHandler;
