export default class TestPage {


    constructor() {
    }

    open() {
        return browser.get('/index.html');
    }

    data = element(by.binding('$ctrl.list.data'));
}