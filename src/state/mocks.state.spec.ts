import 'reflect-metadata';
import {Container} from 'inversify';

import * as sinon from 'sinon';

import GlobalState from './global.state';
import MocksState from './mocks.state';
import SessionState from './session.state';
import State from './state';

describe('MocksState', () => {
    let container: Container;
    let mocksState: MocksState;
    const simpleMock = {
        name: 'simple',
        request: {
            url: 'some/api',
            method: 'GET',
        },
        responses: {
            one: {},
            two: {}
        }
    };
    const advancedMock = {
        name: 'advanced',
        request: {
            url: 'some/api',
            method: 'POST',
            headers: {
                'Content-Type': '.*/json',
                'Cache-Control': 'no-cache'
            },
            payload: {
                number: '\\d+',
                identifier: '^[a-zA-Z]{4}$'
            }
        },
        responses: {
            three: {},
            four: {}
        }
    };

    let getMatchingStateFn: sinon.SinonStub;

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState);
        mocksState = container.get<MocksState>('MocksState');

        mocksState.mocks.push(simpleMock);
        mocksState.mocks.push(advancedMock);

        getMatchingStateFn = sinon.stub(MocksState.prototype, 'getMatchingState');
    });

    describe('getMatchingState', () => {
        let globalState: GlobalState;
        const SOME = 'some';
        const SOME_MOCK = {
            scenario: 'thing',
            echo: true,
            delay: 0
        };

        beforeEach(() => {
            globalState = mocksState.global;
            globalState.mocks[SOME] = SOME_MOCK;
            globalState.variables[SOME] = SOME;

            mocksState.sessions = [];

            getMatchingStateFn.callThrough();
        });

        describe('id === undefined', () =>
            it('returns the global mocksState', () => {
                const matchingState = mocksState.getMatchingState(undefined);
                expect(matchingState).toBe(globalState);
            })
        );

        describe('no session matching the id', () =>
            it('returns a new SessionState by cloning the GlobalState', () => {
                const matchingState = mocksState.getMatchingState('someId');
                expect(mocksState.sessions.length).toBe(1);

                expect((matchingState as SessionState).identifier).toBe('someId');
                expect(Object.keys(matchingState.mocks).length).toBe(1);
                expect(matchingState.mocks[SOME]).toEqual(SOME_MOCK);
                expect(Object.keys(matchingState.variables).length).toBe(1);
                expect(matchingState.variables[SOME]).toBe(SOME);
            })
        );

        describe('session matches the id', () => {
            let sessionState: SessionState;
            beforeEach(() => {
                sessionState = new SessionState('someId');
                mocksState.sessions.push(sessionState);
            });
            it('returns the matching SessionState', () => {
                const matchingState = mocksState.getMatchingState('someId');
                expect(mocksState.sessions.length).toBe(1);
                expect(matchingState).toBe(sessionState);
            });
        });

        afterEach(() => {
            getMatchingStateFn.reset();
        });
    });

    describe('getMatchingMock', () => {
        const VALID_PAYLOAD = {number: 123, identifier: 'abcd'};
        const INVALID_PAYLOAD = {number: 123, identifier: 'ab'};
        const VALID_HEADERS = {'content-type': 'application/json', 'cache-control': 'no-cache'};
        const INVALID_HEADERS = {'content-type': 'application/json', 'cache-control': 'public'};
        const VALID_URL = 'some/api';
        const INVALID_URL = 'no/match';

        it('returns undefined when the request does not match any mock', () => {
            // url does not match
            expect(mocksState.getMatchingMock(INVALID_URL, 'POST', VALID_HEADERS, VALID_PAYLOAD)).toBeUndefined();
            // method does not match
            expect(mocksState.getMatchingMock(VALID_URL, 'PUT', VALID_HEADERS, VALID_PAYLOAD)).toBeUndefined();
            // headers do not match
            expect(mocksState.getMatchingMock(VALID_URL, 'POST', INVALID_HEADERS, VALID_PAYLOAD)).toBeUndefined();
            // payload does not match
            expect(mocksState.getMatchingMock(VALID_URL, 'POST', VALID_HEADERS, INVALID_PAYLOAD)).toBeUndefined();
        });

        it('returns the matching mock when the request matches', () => {
            // match simple mock - only url and method
            expect(mocksState.getMatchingMock(VALID_URL, 'GET', {}, {})).toBe(simpleMock);
            // match advanced mock - url, method, headers, payload
            expect(mocksState.getMatchingMock(VALID_URL, 'POST', VALID_HEADERS, VALID_PAYLOAD)).toBe(advancedMock);
        });
    });

    describe('getResponse', () => {
        let state: State;
        beforeEach(() => {
            state = {
                mocks: {
                    simple: {
                        scenario: 'one',
                        delay: 0,
                        echo: false
                    }
                },
                variables: {}
            };
            getMatchingStateFn.returns(state);
        });

        it('returns undefined when there is no matching mock', () => {
            // no matching mock
            const response = mocksState.getResponse('noMatch', 'id');
            expect(response).toBeUndefined();
        });

        it('returns the selected response for the matching mock', () => {
            const response = mocksState.getResponse('simple', 'id');
            expect(response).toBe(simpleMock.responses['one']);
        });

        afterEach(() => {
            getMatchingStateFn.reset();
        });
    });

    describe('getDelay', () => {
        let state: State;
        beforeEach(() => {
            state = {
                mocks: {
                    simple: {
                        scenario: 'one',
                        delay: 1000,
                        echo: false
                    }
                },
                variables: {}
            };
            getMatchingStateFn.returns(state);
        });

        it('returns 0 when there is no matching mock', () => {
            // no matching mock
            const response = mocksState.getDelay('noMatch', 'id');
            expect(response).toBe(0);
        });

        it('returns the set delay for the matching mock', () => {
            const response = mocksState.getDelay('simple', 'id');
            expect(response).toBe(1000);
        });

        afterEach(() => {
            getMatchingStateFn.reset();
        });
    });

    describe('getEcho', () => {
        let state: State;
        beforeEach(() => {
            state = {
                mocks: {
                    simple: {
                        scenario: 'one',
                        delay: 1000,
                        echo: true
                    }
                },
                variables: {}
            };
            getMatchingStateFn.returns(state);
        });

        it('returns false when there is no matching mock', () => {
            // no matching mock
            const response = mocksState.getEcho('noMatch', 'id');
            expect(response).toBe(false);
        });

        it('returns the set delay for the matching mock', () => {
            const response = mocksState.getEcho('simple', 'id');
            expect(response).toBe(true);
        });

        afterEach(() => {
            getMatchingStateFn.reset();
        });
    });

    describe('getVariables', () => {
        let state: State;
        beforeEach(() => {
            state = {
                mocks: {},
                variables: {
                    this:'this',
                    that: 'that'
                }
            };
            getMatchingStateFn.returns(state);
        });

        it('returns the state variables', () => {
            const response = mocksState.getVariables('id');
            expect(response).toBe(state.variables);
        });

        afterEach(() => {
            getMatchingStateFn.reset();
        });
    });

    describe('setToDefaults', () => {
        let state: State;
        beforeEach(() => {
            state = {
                mocks: {
                    simple: {
                        scenario: 'one',
                        delay: 1000,
                        echo: true
                    },
                    advanced: {
                        scenario: 'three',
                        delay: 3000,
                        echo: false
                    }
                },
                variables: {}
            };

            mocksState.defaults['simple'] = {
                scenario: 'two',
                delay:2000,
                echo: false
            };
            mocksState.defaults['advanced'] = {
                scenario: 'four',
                delay:4000,
                echo: true
            };
        });

        it('sets the state to defaults', () => {
            getMatchingStateFn.returns(state);
            let simpleMockState = state.mocks['simple'];
            expect(simpleMockState.scenario).toBe('one');
            expect(simpleMockState.delay).toBeTruthy(1000);
            expect(simpleMockState.echo).toBe(true);

            let advancedMockState = state.mocks['advanced'];
            expect(advancedMockState.scenario).toBe('three');
            expect(advancedMockState.delay).toBeTruthy(3000);
            expect(advancedMockState.echo).toBe(false);

            mocksState.setToDefaults('id');

            simpleMockState = state.mocks['simple'];
            expect(simpleMockState.scenario).toBe('two');
            expect(simpleMockState.delay).toBeTruthy(2000);
            expect(simpleMockState.echo).toBe(false);

            advancedMockState = state.mocks['advanced'];
            expect(advancedMockState.scenario).toBe('four');
            expect(advancedMockState.delay).toBeTruthy(4000);
            expect(advancedMockState.echo).toBe(true);
        });

        afterEach(() => {
            getMatchingStateFn.reset();
        });
    });

    describe('setToPassThroughs', () => {
        let state: State;
        beforeEach(() => {
            state = {
                mocks: {
                    simple: {
                        scenario: 'one',
                        delay: 1000,
                        echo: true
                    },
                    advanced: {
                        scenario: 'three',
                        delay: 3000,
                        echo: false
                    }
                },
                variables: {}
            };

            mocksState.defaults['simple'] = {
                scenario: 'two',
                delay:2000,
                echo: false
            };
            mocksState.defaults['advanced'] = {
                scenario: 'four',
                delay:4000,
                echo: true
            };
        });

        it('sets the state to defaults', () => {
            getMatchingStateFn.returns(state);
            let simpleMockState = state.mocks['simple'];
            expect(simpleMockState.scenario).toBe('one');
            expect(simpleMockState.delay).toBeTruthy(1000);
            expect(simpleMockState.echo).toBe(true);

            let advancedMockState = state.mocks['advanced'];
            expect(advancedMockState.scenario).toBe('three');
            expect(advancedMockState.delay).toBeTruthy(3000);
            expect(advancedMockState.echo).toBe(false);

            mocksState.setToPassThroughs('id');

            simpleMockState = state.mocks['simple'];
            expect(simpleMockState.scenario).toBe('passThrough');
            expect(simpleMockState.delay).toBeTruthy(1000);
            expect(simpleMockState.echo).toBe(true);

            advancedMockState = state.mocks['advanced'];
            expect(advancedMockState.scenario).toBe('passThrough');
            expect(advancedMockState.delay).toBeTruthy(3000);
            expect(advancedMockState.echo).toBe(false);
        });

        afterEach(() => {
            getMatchingStateFn.reset();
        });
    });
});
