import * as sinon from 'sinon';

import WebdriverIOClient from './webdriverio';

describe('WebdriverIOClient', () => {
    const BASE_URL = 'http://localhost:9000';
    let client: WebdriverIOClient;
    let resolveFn: sinon.SinonStub;
    let rejectFn: sinon.SinonStub;
    let deferredPromise: any;
    let browserGetProcessedConfigThenFn: any;
    let browserUrlFn: sinon.SinonStub;
    let browserSetCookieFn: sinon.SinonStub;

    beforeAll(() => {
        deferredPromise = {};
        browserGetProcessedConfigThenFn = sinon.stub();
        browserUrlFn = sinon.stub();
        browserSetCookieFn = sinon.stub();

        (global as any)['browser'] = {
            options: {
                baseUrl: BASE_URL
            },
            url: browserUrlFn,
            setCookie: browserSetCookieFn
        };

        resolveFn = sinon.stub();
        rejectFn = sinon.stub();

        client = new WebdriverIOClient();
    });

    describe('constructor', () =>
        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe(BASE_URL + '/ngapimock')));

    describe('openUrl', () =>
        it('opens the url', async () => {
            await client.openUrl('url');
            sinon.assert.calledWith(browserUrlFn, 'url');
        }));

    describe('setCookie', () =>
        it('sets the cookie', async () => {
            await client.setCookie('name', 'value');
            sinon.assert.calledWith(browserSetCookieFn, {name: 'name', value: 'value'});
        }));

    describe('wrapAsPromise', () =>
        it('returns a promise', () =>
            expect(client.wrapAsPromise(() => {
            }) instanceof Promise).toBe(true)));
});
