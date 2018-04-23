import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';
import {ApplicableHandler} from '../handler';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

/**  Update mocks handler. */
@injectable()
class UpdateMocksHandler implements ApplicableHandler {
    private PASS_THROUGH = 'passThrough';

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
        id: string, payload: { name: string, scenario?: string, echo?: boolean, delay?: number }
    }): void {
        const state = this.mocksState.getMatchingState(params.id);
        const payload = params.payload;
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

    /** {@inheritDoc}.*/
    isApplicable(request: http.IncomingMessage): boolean {
        const methodMatches = request.method === HttpMethods.PUT;
        const urlMatches = request.url.startsWith(`${this.baseUrl}/mocks`);
        return urlMatches && methodMatches;
    }
}

export default UpdateMocksHandler;
