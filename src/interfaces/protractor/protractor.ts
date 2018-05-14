import ApimockClient from '../apimock.client';
import BaseApimockClient from '../base.client';
import {browser, protractor} from 'protractor';

/** Protractor client for apimock. */
class ProtractorClient extends BaseApimockClient implements ApimockClient {
    usePromise: boolean;

    /** Constructor.*/
    constructor() {
        super(browser.baseUrl);

        /** Make sure to use the correct promise. */
        browser.getProcessedConfig().then((config) => {
            this.usePromise = !config.SELENIUM_PROMISE_MANAGER;
        });
    }

    /** {@inheritDoc}. */
    async openUrl(url: string): Promise<any> {
        return await browser.driver.get(url);
    }

    /** {@inheritDoc}. */
    async setCookie(name: string, value: string): Promise<any> {
        return await (browser.manage() as any).addCookie({name: name, value: value});
    }

    /**
     * {@inheritDoc}.
     * Since the SELENIUM_PROMISE_MANAGER flag has been introduced we need to make sure to return the correct promise.
     * Therefor the following promise should be returned:
     * - SELENIUM_PROMISE_MANAGER is false => new Promise
     * - else => protractor.promise.defer
     */
    wrapAsPromise(fn: Function): Promise<any> {
        if (this.usePromise) {
            return new Promise((resolve, reject) => {
                fn(resolve, reject);
            });
        } else {
            const deferred = protractor.promise.defer();
            fn(deferred.fulfill, deferred.reject);
            return deferred.promise as any;
        }
    }

    /**
     * Sets the variable. If the variable already exists, it will be overridden.
     * @param {string} key The key.
     * @param {string} value The value.
     * @return {Promise} promise The promise.
     * @deprecated use {@link setVariable}
     */
    async setGlobalVariable(key: string, value: string): Promise<any> {
        return await this.setVariable(key, value);
    }

    /**
     * Sets the variables. If the variable already exists, it will be overridden.
     * @param body The body.
     * @return {Promise} promise The promise.
     * @deprecated use {@link setVariables}
     */
    async setGlobalVariables(body: { [p: string]: string }): Promise<any> {
        return await this.setVariables(body);
    }

    /**
     * Removes the variable matching the given key.
     * @param {string} key The key.
     * @return {Promise} promise The promise.
     * @deprecated use {@link deleteVariable}
     */
    async deleteGlobalVariable(key: string): Promise<any> {
        return await this.deleteVariable(key);
    }

    /**
     * Sets for all the mocks the selected scenario back to the default.
     * @return {Promise} promise The promise.
     * @deprecated use {@link resetMocksToDefault}.
     */
    async setAllScenariosToDefault(): Promise<any> {
        return await this.resetMocksToDefault();
    }

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     * @deprecated use {@link setMocksToPassThrough
     */
    async setAllScenariosToPassThrough(): Promise<any> {
        return await this.setMocksToPassThrough();
    }
}

export default ProtractorClient;