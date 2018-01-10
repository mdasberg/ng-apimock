import State from './state';

/** Session state. */
class SessionState implements State {
    identifier: string;
    mocks: {
        [identifier: string]: {
            scenario: string;
            delay: number;
            echo: boolean;
        }
    };
    variables: { [key: string]: string; };

    /**
     * Constructor.
     * @param {string} identifier The session identifier.
     */
    constructor(identifier: string) {
        this.identifier = identifier;
        this.mocks = {};
        this.variables = {};
    }
}

export default SessionState;
