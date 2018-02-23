import * as sinon from 'sinon';
import {browser} from 'protractor';

import BaseApimockClient from '../base.client';
import ProtractorClient from './protractor';

describe('ProtractorClient', () => {
    const BASE_URL = 'http://localhost:9000';
    let client: ProtractorClient;
    let updateMockFn: sinon.SinonStub;
    let updateMockRequestFn: sinon.SinonStub;
    let setVariablesRequestFn: sinon.SinonStub;
    let deleteVariableRequestFn: sinon.SinonStub;
    let performActionRequestFn: sinon.SinonStub;
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

        updateMockFn = sinon.stub(ProtractorClient.prototype, 'updateMock');
        updateMockRequestFn = sinon.stub(BaseApimockClient.prototype, 'updateMockRequest');
        setVariablesRequestFn = sinon.stub(BaseApimockClient.prototype, 'setVariablesRequest');
        deleteVariableRequestFn = sinon.stub(BaseApimockClient.prototype, 'deleteVariableRequest');
        performActionRequestFn = sinon.stub(BaseApimockClient.prototype, 'performActionRequest');
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

    describe('selectScenario', () =>
        it('sets the mock scenario', () => {
            const name = 'name';
            const scenario = 'scenario';
            client.selectScenario(name, scenario);
            sinon.assert.calledWith(updateMockFn, {name: name, scenario: scenario})
        }));

    describe('delayResponse', () =>
        it('sets the mock response delay time', () => {
            const name = 'name';
            const delay = 1000;
            client.delayResponse(name, delay);
            sinon.assert.calledWith(updateMockFn, {name: name, delay: delay});
        }));

    describe('echoRequest', () =>
        it('sets the mock echo indicator', () => {
            const name = 'name';
            const echo = true;
            client.echoRequest(name, echo);
            sinon.assert.calledWith(updateMockFn, {name: name, echo: echo});
        }));

    describe('updateMock', () =>
        it('calls updateMockRequest', () => {
            const name = 'name';
            const echo = true;
            const scenario = 'scenario';
            const delay = 1000;
            updateMockFn.callThrough();
            client.updateMock({name: name, scenario: scenario, delay: delay, echo: echo});
            sinon.assert.calledWith(updateMockRequestFn, {name: name, scenario: scenario, delay: delay, echo: echo});
        }));

    describe('setVariable', () =>
        it('sets the variable', () => {
            client.setVariable('one', 'first');
            sinon.assert.calledWith(setVariablesRequestFn, {one: 'first'});
        }));

    describe('setVariables', () =>
        it('sets the variables', () => {
            const variables = {'one': 'first', 'two': 'second'};
            client.setVariables(variables);
            sinon.assert.calledWith(setVariablesRequestFn, variables);
        }));

    describe('deleteVariable', () =>
        it('deletes the variable', () => {
            const key = 'one';
            client.deleteVariable(key);
            sinon.assert.calledWith(deleteVariableRequestFn, key);
        }));

    describe('resetMocksToDefault', () =>
        it('resets the mocks to defaults', () => {
            client.resetMocksToDefault();
            sinon.assert.calledWith(performActionRequestFn, {action: 'defaults'});
        }));

    describe('setMocksToPassThrough', () =>
        it('sets the mocks to passThrough', () => {
            client.setMocksToPassThrough();
            sinon.assert.calledWith(performActionRequestFn, {action: 'passThroughs'});
        }));

    describe('request', () => {
        describe('use promise', () =>
            it('returns a promise', () => expect(client._request(() => {
                client.usePromise = true;
            }) instanceof Promise).toBe(true)));

        describe('use promise === false', () =>
            it('returns a  protractor.promise.defer', () => expect(client._request(() => {
                client.usePromise = false;
            }) === deferredPromise).toBe(false)));
    });

    afterEach(() => {
        updateMockFn.reset();
        updateMockRequestFn.reset();
        setVariablesRequestFn.reset();
        deleteVariableRequestFn.reset();
        performActionRequestFn.reset();
    });

    afterAll(() => {
        updateMockFn.restore();
        updateMockRequestFn.restore();
        setVariablesRequestFn.restore();
        deleteVariableRequestFn.restore();
        performActionRequestFn.restore();
    });
});
