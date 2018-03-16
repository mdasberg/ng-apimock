import ProtractorClient from './protractor/protractor';
import WebdriverIOClient from './webdriverio/webdriverio';

class Interfaces {
    get protractor() {
        const client = new ProtractorClient();
        return client.setApimockCookie();
    }

    get webdriverio() {
        let client = new WebdriverIOClient();
        return client.setApimockCookie();
    }
}

module.exports = new Interfaces();