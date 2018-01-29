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
        const state = this.mocksState.getMatchingState(params.id);
        if (request.method === HttpMethods.GET) {
            this.handleGetMocks(response, state);
        } else if (request.method === HttpMethods.PUT) {
            this.handleSelectMockScenario(response, state, params.payload);
        }
    }

    /**
     * Gets the mocks.
     * @param {"http".ServerResponse} response The http response.
     * @param {State} state The state.
     */
    handleGetMocks(response: http.ServerResponse, state: State): void {
        const result: any = {
            state: state.mocks,
            recordings: this.mocksState.recordings,
            mocks: this.mocksState.mocks.map((mock) => ({
                name: mock.name,
                request: mock.request,
                responses: Object.keys(mock.responses)
            }))
        };
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(result));
    }

    /**
     * Select the scenario.
     * @param {"http".ServerResponse} response The http response.
     * @param {State} state The state.
     */
    handleSelectMockScenario(response: http.ServerResponse, state: State, payload: {
        name: string, scenario: string, echo: boolean, delay: number
    }): void {
        try {
            const mockName: string = payload.name;
            const matchingMock: Mock = this.mocksState.mocks.find((mock) => mock.name === mockName);

            if (matchingMock !== undefined) {
                const scenario: string = payload.scenario;
                const echo: boolean = payload.echo;
                const delay: number = payload.delay;

                if (echo !== undefined) {
                    state.mocks[mockName].echo = echo;
                }
                if (delay !== undefined) {
                    state.mocks[mockName].delay = delay;
                }

                if (scenario !== undefined) {
                    if (scenario === this.PASS_THROUGH ||
                        Object.keys(matchingMock.responses).find((_scenario) => _scenario === scenario)) {
                        state.mocks[mockName].scenario = scenario;
                    } else {
                        throw new Error(`No scenario matching ['${scenario}'] found`);
                    }
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
