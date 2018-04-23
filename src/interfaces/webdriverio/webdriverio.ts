import ApimockClient from '../apimock.client';
import BaseApimockClient from '../base.client';

/** Webdriver.io client for apimock. */
class WebdriverIOClient extends BaseApimockClient implements ApimockClient {
    /** Constructor.*/
    constructor() {
        super(browser.options.baseUrl);
    }

    /** {@inheritDoc}. */
    async openUrl(url: string): Promise<any> {
        return await browser.url(url);
    }

    /** {@inheritDoc}. */
    async setCookie(name: string, value: string): Promise<any> {
        return await browser.setCookie({name: name, value: value});
    }

    /** {@inheritDoc}. */
    wrapAsPromise(fn: Function): Promise<any> {
        return new Promise((resolve, reject) => {
            fn(resolve, reject);
        });
    }
}

export default WebdriverIOClient;