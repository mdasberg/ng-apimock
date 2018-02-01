interface ApimockClient {

    /**
     * Sets the given scenario as selected for the mock matching the name.
     * @param {string} name The name of the mock.
     * @param {string} scenario The scenario.
     * @return {Promise} promise The promise.
     */
    selectScenario(name: string, scenario: string): Promise<any>;

    /**
     * Sets the given delay time in milliseconds for the mock matching the identifier.
     * @param {string} name The name of the mock.
     * @param {number} delay The delay time in milliseconds.
     * @return {Promise} promise The promise.
     */
    delayResponse(name: string, delay: number): Promise<any>;

    /**
     * Sets the given echo indicator for the mock matching the identifier.
     * @param {string} name The name of the mock.
     * @param {boolean} echo The indicator echo request.
     * @return {Promise} promise The promise.
     */
    echoRequest(name: string, echo: boolean): Promise<any>;

    /**
     * Sets the variable.
     * @param {string} key The key.
     * @param {string} value The value.
     * @return {Promise} promise The promise.
     */
    setVariable(key: string, value: string): Promise<any>;

    /**
     * Sets the variables.
     * @param payload The payload.
     * @return {Promise} promise The promise.
     */
    setVariables(payload: { [key: string]: string }): Promise<any>;

    /**
     * Sets for all the mocks the selected scenario back to the default.
     * @return {Promise} promise The promise.
     */
    resetMocksToDefault(): Promise<any>;

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     */
    setMocksToPassThrough(): Promise<any>;
}
