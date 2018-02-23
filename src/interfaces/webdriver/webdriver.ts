import BaseApimockClient from '../base.client';
import ApimockClient from '../apimock.client';

class WebdriverClient extends BaseApimockClient implements ApimockClient {
    /** Constructor.*/
    constructor() {

        super(browser.options.baseUrl);
        /** Make sure that angular uses the ngapimock identifier for the requests. */
        require('hooker').hook(browser, 'url', {
            post: (result: any) => {
                return result.then(() => {
                    return browser.setCookie({name: 'apimockid', value: this.apimockId});
                });
            }
        });
    }

    /**
     * Gets the mocks.
     * @return {Promise<any>} promise The promise.
     */
    getMocks(): Promise<any> {
        return this._request((resolve: Function, reject: Function) =>
            this.getMocksRequest(resolve, reject));
    }

    /**
     * Gets the variables.
     * @return {Promise<any>} promise The promise.
     */
    getvariables(): Promise<any> {
        return this._request((resolve: Function, reject: Function) =>
            this.getVariablesRequest(resolve, reject));
    }

    /** {@inheritDoc}. */
    selectScenario(name: string, scenario: string): Promise<any> {
        return this.updateMock({name: name, scenario: scenario});
    }

    /** {@inheritDoc}. */
    delayResponse(name: string, delay: number): Promise<any> {
        return this.updateMock({name: name, delay: delay});
    }

    /** {@inheritDoc}. */
    echoRequest(name: string, echo: boolean): Promise<any> {
        return this.updateMock({name: name, echo: echo});
    }

    /** {@inheritDoc}. */
    updateMock(payload: { name: string, scenario?: string, delay?: number, echo?: boolean }): Promise<any> {
        return this._request((resolve: Function, reject: Function) =>
            this.updateMockRequest(payload, resolve, reject));
    }

    /** {@inheritDoc}. */
    setVariable(key: string, value: string): Promise<any> {
        const payload: { [key: string]: string } = {};
        payload[key] = value;
        return this.setVariables(payload);
    }

    /** {@inheritDoc}. */
    setVariables(payload: { [key: string]: string }): Promise<any> {
        return this._request((resolve: Function, reject: Function) =>
            this.setVariablesRequest(payload, resolve, reject));
    }

    /** {@inheritDoc}. */
    deleteVariable(key: string): Promise<any> {
        return this._request((resolve: Function, reject: Function) =>
            this.deleteVariableRequest(key, resolve, reject));
    }

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     * @deprecated use {@link setMocksToPassThrough
     */
    setAllScenariosToPassThrough(): Promise<any> {
        return this.setMocksToPassThrough();
    }

    /**
     * Sets for all the mocks the selected scenario back to the default.
     * @return {Promise} promise The promise.
     */
    resetMocksToDefault(): Promise<any> {
        return this._request((resolve: Function, reject: Function) =>
            this.performActionRequest({action: 'defaults'}, resolve, reject));
    }

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     */
    setMocksToPassThrough(): Promise<any> {
        return this._request((resolve: Function, reject: Function) =>
            this.performActionRequest({action: 'passThroughs'}, resolve, reject));
    }

    /**
     * Execute the request.
     * @param {Function} fn The function to perform.
     * @return {Promise} promise The promise.
     * @private
     */
    _request(fn: Function): Promise<any> {
        return new Promise((resolve, reject) => {
            fn(resolve, reject);
        });
    }
}

export default WebdriverClient;