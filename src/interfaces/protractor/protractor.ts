import {browser, protractor} from 'protractor';
import ApimockClient from '../apimock.client';
import BaseApimockClient from '../base.client';

/** Protractor client for apimock. */
class ProtractorClient extends BaseApimockClient implements ApimockClient {
    usePromise: boolean;

    /** Constructor.*/
    constructor() {
        super(browser.baseUrl);

        /** Make sure that angular uses the ngapimock identifier for the requests. */
        browser.getProcessedConfig().then((config) => {
            require('hooker').hook(browser, 'get', {
                post: (result: any) => {
                    return result.then(() => {
                        // Since protractor 5.0.0 the addCookie is an object, see
                        // https://github.com/angular/protractor/blob/master/CHANGELOG.md#500
                        try {
                            return (browser.manage() as any).addCookie({name: 'apimockid', value: this.apimockId});
                        } catch (error) {
                            // Fallback protractor < 5.0.0
                            return browser.manage().addCookie('apimockid', this.apimockId);
                        }
                    });
                }
            });
            this.usePromise = !config.SELENIUM_PROMISE_MANAGER;
        });
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
    setGlobalVariable(key: string, value: string): Promise<any> {
        return this.setVariable(key, value);
    }

    /**
     * Sets the variables. If the variable already exists, it will be overridden.
     * @param payload The payload
     * @return {Promise} promise The promise.
     * @deprecated use {@link setVariables}
     */
    setGlobalVariables(payload: { [p: string]: string }): Promise<any> {
        return this.setVariables(payload);
    }

    /**
     * Removes the variable matching the given key.
     * @param {string} key The key.
     * @return {Promise} promise The promise.
     * @deprecated use {@link deleteVariable}
     */
    deleteGlobalVariable(key: string): Promise<any> {
        return this.deleteVariable(key);
    }

    /**
     * Sets for all the mocks the selected scenario back to the default.
     * @return {Promise} promise The promise.
     * @deprecated use {@link resetMocksToDefault}.
     */
    setAllScenariosToDefault(): Promise<any> {
        return this.resetMocksToDefault();
    }

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     * @deprecated use {@link setMocksToPassThrough
     */
    setAllScenariosToPassThrough(): Promise<any> {
        return this.setMocksToPassThrough();
    }
}

export default ProtractorClient;