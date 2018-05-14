import {HttpHeaders, HttpMethods} from '../core/middleware/http';

/** Base client that takes care of the actual invoking of the apimock api.*/
abstract class BaseApimockClient {
    apimockId: string;
    baseUrl: string;
    fetch: any;

    /**
     * Constructor.
     * @param {string} baseUrl The base url.
     */
    constructor(baseUrl: string) {
        this.apimockId = require('uuid').v4();
        this.baseUrl = require('url-join')(baseUrl, 'ngapimock');
        this.fetch = require('node-fetch');
    }

    /**
     * Opens the given url.
     * @param {string} url The url.
     * @return {Promise<any>} promise The promise.
     */
    abstract async openUrl(url: string): Promise<any>;

    /**
     * Sets the Apimock cookie.
     * @return {Promise<any>} promise The promise.
     */
    abstract async setCookie(name: string, value: string): Promise<any>;

    /**
     * Sets the apimock cookie.
     * @return {Promise<any>} promise The promise.
     */
    async setApimockCookie(): Promise<any> {
        await this.openUrl(this.baseUrl + '/init');
        await this.setCookie('apimockid', this.apimockId);
        return this;
    }

    /**
     * Wrap the given function as a promise.
     * @param {Function} func The function.
     * @return {Promise<any>} promise The promise.
     */
    abstract wrapAsPromise(func: Function): Promise<any>;

    /**
     * Gets the mocks.
     * @return {Promise<any>} promise The promise.
     */
    async getMocks(): Promise<any> {
        return await this.wrapAsPromise((resolve: Function, reject: Function) =>
            this._getMocksRequest(resolve, reject));
    }

    /**
     * Gets the mock state.
     * @param {Function} reject The reject callback.
     * @param {Function} resolve The resolve callback.
     * @private
     */
    async _getMocksRequest(resolve: Function, reject: Function): Promise<any> {
        /** wrap it and return the parsed body */
        const _resolve = (res: any) => resolve(res.json());
        return await this.invoke(this.baseUrl + '/mocks', HttpMethods.GET, {}, _resolve, reject);
    }

    /**
     * Gets the variables.
     * @return {Promise<any>} promise The promise.
     */
    async getVariables(): Promise<any> {
        return await this.wrapAsPromise((resolve: Function, reject: Function) =>
            this._getVariablesRequest(resolve, reject));
    }


    /**
     * Gets the variables state.
     * @param {Function} reject The reject callback.
     * @param {Function} resolve The resolve callback.
     */
    async _getVariablesRequest(resolve: Function, reject: Function): Promise<any> {
        /** wrap it and return the parsed body */
        const _resolve = (res: any) => resolve(res.json());
        return await this.invoke(this.baseUrl + '/variables', HttpMethods.GET, {}, _resolve, reject);
    }

    /** {@inheritDoc}. */
    async selectScenario(name: string, scenario: string): Promise<any> {
        return await this.updateMock({name: name, scenario: scenario});
    }

    /** {@inheritDoc}. */
    async delayResponse(name: string, delay: number): Promise<any> {
        return await this.updateMock({name: name, delay: delay});
    }

    /** {@inheritDoc}. */
    async echoRequest(name: string, echo: boolean): Promise<any> {
        return await this.updateMock({name: name, echo: echo});
    }

    /** {@inheritDoc}. */
    async updateMock(body: { name: string, scenario?: string, delay?: number, echo?: boolean }): Promise<any> {
        return await this.wrapAsPromise((resolve: Function, reject: Function) =>
            this._updateMockRequest(body, resolve, reject));
    }

    /**
     * Updates the mock state.
     * @param body The body.
     * @param {Function} reject The reject callback.
     * @param {Function} resolve The resolve callback.
     * @private
     */
    async _updateMockRequest(body: { name: string, scenario?: string, delay?: number, echo?: boolean }, resolve: Function,
                             reject: Function): Promise<any> {
        return await this.invoke(this.baseUrl + '/mocks', HttpMethods.PUT, body, resolve, reject);
    }

    /** {@inheritDoc}. */
    async setVariable(key: string, value: string): Promise<any> {
        const body: { [key: string]: string } = {};
        body[key] = value;
        return await this.setVariables(body);
    }

    /** {@inheritDoc}. */
    async setVariables(body: { [key: string]: string }): Promise<any> {
        return await this.wrapAsPromise((resolve: Function, reject: Function) =>
            this._setVariablesRequest(body, resolve, reject));
    }

    /**
     * Updates the variables.
     * @param body The body
     * @param {Function} reject The reject callback.
     * @param {Function} resolve The resolve callback.
     * @private
     */
    async _setVariablesRequest(body: { [key: string]: string }, resolve: Function, reject: Function): Promise<any> {
        return await this.invoke(this.baseUrl + '/variables', HttpMethods.PUT, body, resolve, reject);
    }

    /** {@inheritDoc}. */
    async deleteVariable(key: string): Promise<any> {
        return await this.wrapAsPromise((resolve: Function, reject: Function) =>
            this._deleteVariableRequest(key, resolve, reject));
    }

    /**
     * Updates the variables.
     * @param key The key
     * @param {Function} reject The reject callback.
     * @param {Function} resolve The resolve callback.
     * @private__
     */
    async _deleteVariableRequest(key: string, resolve: Function, reject: Function): Promise<any> {
        return await this.invoke(this.baseUrl + `/variables/${key}`, HttpMethods.DELETE, {}, resolve, reject);
    }

    /**
     * Sets for all the mocks the selected scenario back to the default.
     * @return {Promise} promise The promise.
     */
    async resetMocksToDefault(): Promise<any> {
        return await this.wrapAsPromise((resolve: Function, reject: Function) =>
            this._performActionRequest({action: 'defaults'}, resolve, reject));
    }

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     */
    async setMocksToPassThrough(): Promise<any> {
        return await this.wrapAsPromise((resolve: Function, reject: Function) =>
            this._performActionRequest({action: 'passThroughs'}, resolve, reject));
    }

    /**
     * Performs an action either defaults or passThrough.
     * @param body The body
     * @param {Function} reject The reject callback.
     * @param {Function} resolve The resolve callback.
     */
    async _performActionRequest(body: { action: string }, resolve: Function, reject: Function): Promise<any> {
        return await this.invoke(this.baseUrl + '/actions', HttpMethods.PUT, body, resolve, reject);
    }

    /**
     * Invokes the api and handles the response.
     * @param {string} url The url.
     * @param {string} method The method.
     * @param body The body.
     * @param {Function} reject The reject callback.
     * @param {Function} resolve The resolve callback.
     */
    async invoke(url: string, method: string, body: any, resolve: Function, reject: Function): Promise<any> {
        const requestInit: RequestInit = {
            method: method,
            headers: Object.assign({}, {
                cookie: `apimockid=${this.apimockId}`
            }, JSON.parse(JSON.stringify(HttpHeaders.CONTENT_TYPE_APPLICATION_JSON)))
        };

        if ([HttpMethods.GET, HttpMethods.DELETE].indexOf(method) === -1) {
            requestInit.body = JSON.stringify(body);
        }

        return await this.fetch(url, requestInit)
            .then((res: any) => resolve(res))
            .catch((res: any) => reject(res));
    }
}

export default BaseApimockClient;