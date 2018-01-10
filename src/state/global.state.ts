import State from './state';

/** Global state. */
class GlobalState implements State {
    mocks: {
        [identifier: string]: {
            scenario: string;
            delay: number;
            echo: boolean;
        }
    };
    variables: { [key: string]: string; };

    /** Constructor. */
    constructor() {
        this.mocks = {};
        this.variables = {};
    }
}

export default GlobalState;
