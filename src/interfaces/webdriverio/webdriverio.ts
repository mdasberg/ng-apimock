import BaseApimockClient from '../base.client';
import ApimockClient from '../apimock.client';

/** Webdriver.io client for apimock. */
class WebdriverIOClient extends BaseApimockClient implements ApimockClient {
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

    /** {@inheritDoc}. */
    wrapAsPromise(fn: Function): Promise<any> {
        return new Promise((resolve, reject) => {
            fn(resolve, reject);
        });
    }
}

export default WebdriverIOClient;