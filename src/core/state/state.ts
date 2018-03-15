/** State. */
interface State {
    mocks: {
        [identifier: string]: {
            scenario: string;
            delay: number;
            echo: boolean;
        }
    };
    variables: { [key: string]: string };
}

export default State;
