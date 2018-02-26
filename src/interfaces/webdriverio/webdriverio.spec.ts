import * as sinon from 'sinon';

import WebdriverIOClient from './webdriverio';

describe('WebdriverIOClient', () => {
    const BASE_URL = 'http://localhost:9000';
    let client: WebdriverIOClient;
    let resolveFn: sinon.SinonStub;
    let rejectFn: sinon.SinonStub;
    let deferredPromise: any;
    let browserGetProcessedConfigThenFn: any;
    let browserUrlThenFn: sinon.SinonStub;
    let browserSetCookieFn: sinon.SinonStub;

    beforeAll(() => {
        deferredPromise = {};
        browserGetProcessedConfigThenFn = sinon.stub();
        browserUrlThenFn = sinon.stub();
        browserSetCookieFn = sinon.stub();

        (global as any)['browser'] = {
            options: {
                baseUrl: BASE_URL
            },
            url: () => ({
                then: browserUrlThenFn
            }),
            setCookie: browserSetCookieFn
        };

        resolveFn = sinon.stub();
        rejectFn = sinon.stub();

        client = new WebdriverIOClient();
    });

    describe('constructor', () => {
        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe(BASE_URL + '/ngapimock'));

        it('sets the apimockid cookie', () => {
            (global as any)['browser'].url(undefined); // call the hook
            browserUrlThenFn.getCall(0).args[0](); // resolve then
            sinon.assert.calledWith(browserSetCookieFn, {name: 'apimockid', value: client.apimockId});
        });
    });

    describe('wrapAsPromise', () =>
        it('returns a promise', () =>
            expect(client.wrapAsPromise(() => {
            }) instanceof Promise).toBe(true)));
});
