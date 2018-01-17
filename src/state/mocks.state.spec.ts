import 'reflect-metadata';
import {Container} from 'inversify';

import GlobalState from './global.state';
import MocksState from './mocks.state';
import SessionState from './session.state';

describe('MocksState', () => {
    let state: MocksState;
    const SOME_MOCK = {
        scenario: 'thing',
        echo: true,
        delay: 0
    };
    const SOME = 'some';

    beforeAll(() => {
        const container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState);

        state = container.get<MocksState>('MocksState');
    });


    describe('getMatchingState', () => {
        let globalState: GlobalState;

        beforeEach(()=> {
            globalState = state.global;
            globalState.mocks['some'] = SOME_MOCK;
            globalState.variables['some'] = SOME;
        });

        it('returns the global state if no id is undefined', () => {
            const matchingState = state.getMatchingState(undefined);
            expect(matchingState).toBe(globalState);
        });

        it('returns a newly create SessionState from the cloned GlobalState', () => {
            expect(state.sessions.length).toBe(0);
            const matchingState = state.getMatchingState('someId');
            expect(state.sessions.length).toBe(1);

            expect((matchingState as SessionState).identifier).toBe('someId');
            expect(Object.keys(matchingState.mocks).length).toBe(1);
            expect(matchingState.mocks['some']).toEqual(SOME_MOCK);
            expect(Object.keys(matchingState.variables).length).toBe(1);
            expect(matchingState.variables['some']).toBe(SOME);
        });

        it('returns the matching SessionState', () => {
            const sessionState: SessionState = state.sessions[0];
            expect(state.sessions.length).toBe(1);
            const matchingState = state.getMatchingState('someId');
            expect(state.sessions.length).toBe(1);
            expect(matchingState).toBe(sessionState);

        });

    });
});
