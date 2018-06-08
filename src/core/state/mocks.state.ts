import 'reflect-metadata';
import {injectable} from 'inversify';

import GlobalState from './global.state';
import Mock from '../domain/mock';
import MockResponse from '../domain/mock.response';
import SessionState from './session.state';
import State from './state';
import {IncomingHttpHeaders} from 'http';
import Recording from './recording';

/** The mocks state. */
@injectable()
class MocksState {
    mocks: Mock[];
    defaults: {
        [identifier: string]: {
            scenario: string;
            delay: number;
            echo: boolean;
        }
    };
    recordings: { [identifier: string]: Recording[] };
    record: boolean;
    global: GlobalState;
    sessions: SessionState[];
    private DEFAULT_DELAY = 0;
    private DEFAULT_ECHO = false;
    private PASS_THROUGH = 'passThrough';

    /** Constructor. */
    constructor() {
        this.mocks = [];
        this.defaults = {};
        this.recordings = {};
        this.record = false;
        this.global = new GlobalState();
        this.sessions = [];
    }

    /**
     * Gets the matching state.
     * @param {string} id The apimock id.
     * @return {State} state The matching state.
     */
    getMatchingState(id: string): State {
        let state: State = this.global;
        if (id) {
            state = this.sessions.find((session: SessionState) => session.identifier === id);
            if (state === undefined) {
                state = new SessionState(id);
                state.mocks = JSON.parse(JSON.stringify(this.global.mocks));
                state.variables = JSON.parse(JSON.stringify(this.global.variables));
                this.sessions.push(state as SessionState);
            }
        }
        return state;
    }

    /**
     * Gets the mock matching the given url, method, headers and body.
     * @param {string} url The url.
     * @param {string} method The method.
     * @param {IncomingHttpHeaders} headers The headers.
     * @param {any} body The body.
     * @return {Mock} mock The matching mock.
     */
    getMatchingMock(url: string, method: string, headers: IncomingHttpHeaders, body: any): Mock {
        return this.mocks.find(_mock => {
            const matchUrl = new RegExp(_mock.request.url).exec(decodeURI(url)) !== null;
            const matchMethod = _mock.request.method === method;

            let matchHeaders = true;
            if (_mock.request.headers !== undefined) {
                matchHeaders = Object.keys(_mock.request.headers).filter((key) => {
                    const defined = headers[key.toLowerCase()] !== undefined;
                    const matched = new RegExp(_mock.request.headers[key]).exec((headers as any)[key.toLowerCase()]) !== null;
                    return !defined || !matched;
                }).length === 0;
            }

            let matchBody = true;
            if (_mock.request.body !== undefined) {
                matchBody = Object.keys(_mock.request.body).filter((key) => {
                    const defined = body[key] !== undefined;
                    const matched = new RegExp(_mock.request.body[key]).exec(body[key]) !== null;
                    return !defined || !matched;
                }).length === 0;
            }

            return matchUrl && matchMethod && matchHeaders && matchBody;
        });
    }

    /**
     * Gets the response for the scenario matching the mock name and apimock id.
     * @param {string} name The name.
     * @param {string} id The apimock id.
     * @return {MockResponse} response The response.
     */
    getResponse(name: string, id: string): MockResponse {
        const state = this.getMatchingState(id);
        let response = undefined;
        let scenario = undefined;

        if (state.mocks[name] !== undefined) {
            scenario = state.mocks[name].scenario;
            const mock = this.mocks.find((_mock: Mock) => _mock.name === name);
            response = mock.responses[scenario];
        }

        return response;
    }

    /**
     * Gets the delay for the scenario matching the mock name and apimock id.
     * @param {string} name The name.
     * @param {string} id The apimock id.
     * @return {number} delay The delay.
     */
    getDelay(name: string, id: string): number {
        const state = this.getMatchingState(id);
        let delay: number = this.DEFAULT_DELAY;

        if (state && state.mocks[name] !== undefined) {
            delay = state.mocks[name].delay;
        }
        return delay;
    }

    /**
     * Gets the echo indicator for the scenario matching the mock name and apimock id.
     * @param {string} name The name.
     * @param {string} id The apimock id.
     * @return {boolean} indicator The indicator.
     */
    getEcho(name: string, id: string): boolean {
        const state = this.getMatchingState(id);
        let echo = this.DEFAULT_ECHO;

        if (state && state.mocks[name] !== undefined) {
            echo = state.mocks[name].echo;
        }
        return echo;
    }

    /**
     * Gets the variables matching the given apimockId.
     * @param {string} id The apimock id.
     * @return {{[key: string]: string}} variables The variables.
     */
    getVariables(id: string): { [key: string]: string; } {
        const state = this.getMatchingState(id);
        let variables: { [key: string]: string } = {};

        if (state) {
            variables = state.variables;
        }
        return variables;
    }

    /**
     * Sets the mocks to the default state.
     * @param {string} id The apimock id.
     */
    setToDefaults(id: string): void {
        const state: State = this.getMatchingState(id);
        Object.keys(state.mocks).forEach((mockName) => {
            state.mocks[mockName] = JSON.parse(JSON.stringify(this.defaults[mockName]));
        });
    }

    /**
     * Sets the mocks to the default state.
     * @param {string} id The apimock id.
     */
    setToPassThroughs(id: string): void {
        const state: State = this.getMatchingState(id);
        Object.keys(state.mocks).forEach((mockName) => {
            state.mocks[mockName].scenario = this.PASS_THROUGH;
        });
    }

}

export default MocksState;
