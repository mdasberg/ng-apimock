import ProtractorClient from './protractor/protractor';
import WebdriverClient from './webdriver/webdriver';

class Interfaces {
    get protractor()   { return new ProtractorClient(); }
    get webdriverio()   { return new WebdriverClient(); }
}

module.exports = new Interfaces();