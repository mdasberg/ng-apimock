import ProtractorClient from './protractor/protractor';
import WebdriverIOClient from './webdriverio/webdriverio';

class Interfaces {
    get protractor()   { return new ProtractorClient(); }
    get webdriverio()   { return new WebdriverIOClient(); }
}

module.exports = new Interfaces();