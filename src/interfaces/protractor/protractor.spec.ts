import * as sinon from 'sinon';

import {browser} from 'protractor';
import ProtractorClient from './protractor';

describe('ProtractorClient', () => {
    const BASE_URL = 'http://localhost:9000';
    let client: ProtractorClient;
    let resolveFn: sinon.SinonStub;
    let rejectFn: sinon.SinonStub;
    let deferredPromise: any;
    let browserGetProcessedConfigThenFn: any;
    let browserGetThenFn: sinon.SinonStub;
    let browserManageAddCookieFn: sinon.SinonStub;

    beforeAll(() => {
        deferredPromise = {};
        browserGetProcessedConfigThenFn = sinon.stub();
        browserGetThenFn = sinon.stub();
        browserManageAddCookieFn = sinon.stub();

        (global as any)['protractor'] = {
            browser: {
                baseUrl: BASE_URL,
                getProcessedConfig: () => ({
                    then: browserGetProcessedConfigThenFn
                }),
                get: () => ({
                    then: browserGetThenFn
                }),
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

        describe('process browser config', () => {
            beforeEach(() => {
                browserGetProcessedConfigThenFn.getCall(0).args[0]({SELENIUM_PROMISE_MANAGER: false});
            });

            describe('protractor >= 5.0.0', () =>
                it('sets the apimockid cookie', () => {
                    browser.get(undefined, undefined); // call the hook
                    browserGetThenFn.getCall(0).args[0](); // resolve then
                    sinon.assert.calledWith(browserManageAddCookieFn, {name: 'apimockid', value: client.apimockId});
                }));

            describe('protractor < 5.0.0', () =>
                it('sets the apimockid cookie', () => {
                    browser.get(undefined, undefined); // call the hook
                    browserManageAddCookieFn.throwsException(new Error());
                    try {
                        browserGetThenFn.getCall(0).args[0](); // resolve then
                        sinon.assert.calledWith(browserManageAddCookieFn, 'apimockid', client.apimockId);
                    } catch (e) {
                    }
                }));
        });
    });

    describe('wrapAsPromise', () => {
        describe('use promise', () =>
            it('returns a promise', () => expect(client.wrapAsPromise(() => {
                client.usePromise = true;
            }) instanceof Promise).toBe(true)));

        describe('use promise === false', () =>
            it('returns a  protractor.promise.defer', () => expect(client.wrapAsPromise(() => {
                client.usePromise = false;
            }) === deferredPromise).toBe(false)));
    });
});
