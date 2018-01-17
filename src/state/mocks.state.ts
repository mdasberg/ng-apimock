import 'reflect-metadata';
import {injectable} from 'inversify';

import GlobalState from './global.state';
import SessionState from './session.state';
import HttpResponseRecording from './httpResponseRecording';
import MockResponse from '../domain/mock.response';
import State from './state';
import Mock from '../domain/mock';
import {IncomingHttpHeaders} from 'http';

/** The mocks state. */
@injectable()
class MocksState {
    private DEFAULT_DELAY = 0;
    private PASS_THROUGH = 'passThrough';

    mocks: Mock[];
    defaults: {
        [identifier: string]: {
            scenario: string;
            delay: number;
            echo: boolean;
        }
    };

    recordings: { [identifier: string]: HttpResponseRecording[] };
    record: boolean;

    global: GlobalState;
    sessions: SessionState[];

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
                this.sessions.push(state as SessionState)
            }
        }
        return state;
    }

    /**
     * Gets the mock matching the given url, method, headers and payload.
     * @param {string} url The url.
     * @param {string} method The method.
     * @param {IncomingHttpHeaders} headers The headers.
     * @param {any} payload The payload.
     * @return {Mock} mock The matching mock.
     */
    getMatchingMock(url: string, method: string, headers: IncomingHttpHeaders, payload: any): Mock {
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
            let matchPayload = true;
            if (_mock.request.payload !== undefined) {
                matchPayload = Object.keys(_mock.request.payload).filter((key) => {
                    const defined = payload[key] !== undefined;
                    const matched = new RegExp(_mock.request.payload[key]).exec(payload[key]) !== null;
                    return !defined || !matched;
                }).length === 0;
            }

            return matchUrl && matchMethod && matchHeaders && matchPayload;
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
        let scenario = undefined;

        if (state && state.mocks[name] !== undefined) {
            scenario = state.mocks[name].scenario;
        }

        const mock = this.mocks.find((_mock: Mock) => _mock.name === name);
        return mock.responses[scenario];
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
        let echo = false;

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
    };

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
