import * as sinon from 'sinon';
import ProtractorClient from './protractor';

describe('ProtractorClient', () => {
    const BASE_URL = 'http://localhost:9000';
    let client: ProtractorClient;
    let resolveFn: sinon.SinonStub;
    let rejectFn: sinon.SinonStub;
    let deferredPromise: any;
    let browserGetProcessedConfigThenFn: any;
    let browserGetFn: sinon.SinonStub;
    let browserManageAddCookieFn: sinon.SinonStub;

    beforeAll(() => {
        deferredPromise = {};
        browserGetProcessedConfigThenFn = sinon.stub();
        browserGetFn = sinon.stub();
        browserManageAddCookieFn = sinon.stub();

        (global as any)['protractor'] = {
            browser: {
                baseUrl: BASE_URL,
                getProcessedConfig: () => ({
                    then: browserGetProcessedConfigThenFn
                }),
                driver: {
                    get: browserGetFn
                },
                manage: () => ({
                    addCookie: browserManageAddCookieFn
                })
            },
            promise: {
                defer: () => ({
                    promise: deferredPromise
                })
            }
        };

        resolveFn = sinon.stub();
        rejectFn = sinon.stub();

        client = new ProtractorClient();
    });

    describe('constructor', () => {
        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe(BASE_URL + '/ngapimock'));

        describe('usePromise', () => {
            describe('SELENIUM_PROMISE_MANAGER === false', () =>
                it('use promise = true', () => {
                    browserGetProcessedConfigThenFn.getCall(0).args[0]({SELENIUM_PROMISE_MANAGER: false});
                    expect(client.usePromise).toBe(true);
                }));

            describe('SELENIUM_PROMISE_MANAGER !== false', () =>
                it('use promise = false', () => {
                    browserGetProcessedConfigThenFn.getCall(0).args[0]({SELENIUM_PROMISE_MANAGER: true});
                    expect(client.usePromise).toBe(false);
                }));
        });
    });

    describe('openUrl', () =>
        it('opens the url', async () => {
            await client.openUrl('url');
            sinon.assert.calledWith(browserGetFn, 'url');
        }));

    describe('setCookie', () =>
        it('sets the cookie', async () => {
            await client.setCookie('name', 'value');
            sinon.assert.calledWith(browserManageAddCookieFn, {name: 'name', value: 'value'});
        }));

    describe('wrapAsPromise', () => {
        describe('use promise', () =>
            it('returns a promise', () => {
                client.usePromise = true;
                expect(client.wrapAsPromise(() => {}) instanceof Promise).toBe(true);
            }));

        describe('use promise === false', () =>
            it('returns a protractor.promise.defer', () => {
                client.usePromise = false;
                expect(client.wrapAsPromise(() => {})).toEqual(deferredPromise);
            }));
    });
});
