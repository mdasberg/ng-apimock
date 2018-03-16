class PagePO {
    get data()  { return element(by.className('data')); }
    get status() { return element(by.className('status')); }
    get done() { return element(by.className('done')); }
    get input() { return element(by.id("item")); }

    constructor() {
        this.buttons = new PageButtons();
    }

    open() {
        return browser.get('/index.html');
    }
}

class PageButtons {
    get get() { return element(by.buttonText('get')); }
    get binary() { return element(by.buttonText('binary')); }
    get getAsJsonp() { return  element(by.buttonText('get as jsonp')); }
    get post() { return element(by.buttonText('post')); }
}

module.exports = PagePO;