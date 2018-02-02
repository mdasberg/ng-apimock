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
            describe('SELENIUM_PROMISE_MANAGER === false', () => {
                beforeEach(() => {
                    browserGetProcessedConfigThenFn.getCall(0).args[0]({SELENIUM_PROMISE_MANAGER: false});
                });
                it('use promise = true', () =>
                    expect(client.usePromise).toBe(true));
            });

            describe('SELENIUM_PROMISE_MANAGER !== false', () => {
                beforeEach(() => {
                    browserGetProcessedConfigThenFn.getCall(0).args[0]({SELENIUM_PROMISE_MANAGER: true});
                });
                it('use promise = false', () =>
                    expect(client.usePromise).toBe(false));
            });
        });

        describe('process browser config', () => {
            beforeEach(() => {
                browserGetProcessedConfigThenFn.getCall(0).args[0]({SELENIUM_PROMISE_MANAGER: false});
            });

            describe('protractor >= 5.0.0', () => {
                beforeEach(() => {
                    browser.get(undefined, undefined); // call the hook
                    browserGetThenFn.getCall(0).args[0](); // resolve then
                });
                it('sets the apimockid cookie', () => {
                    sinon.assert.calledWith(browserManageAddCookieFn, {name: 'apimockid', value: client.apimockId});
                });
            });

            describe('protractor < 5.0.0', () => {
                beforeEach(() => {
                    browser.get(undefined, undefined); // call the hook
                    browserManageAddCookieFn.throwsException(new Error());
                });
                it('sets the apimockid cookie', () => {
                    try {
                        browserGetThenFn.getCall(0).args[0](); // resolve then
                        sinon.assert.calledWith(browserManageAddCookieFn, 'apimockid', client.apimockId);
                    } catch (e) {
                    }
                });
            });
        });
    });

    describe('selectScenario', () => {
        let name = 'name';
        let scenario = 'scenario';
        beforeEach(() => {
            client.selectScenario(name, scenario);
        });
        it('sets the mock scenario', () =>
            sinon.assert.calledWith(updateMockFn, {name: name, scenario: scenario}));

        afterEach(() => {
            updateMockFn.reset();
        });
    });

    describe('delayResponse', () => {
        let name = 'name';
        let delay = 1000;
        beforeEach(() => {
            client.delayResponse(name, delay);
        });
        it('sets the mock response delay time', () =>
            sinon.assert.calledWith(updateMockFn, {name: name, delay: delay}));

        afterEach(() => {
            updateMockFn.reset();
        });
    });

    describe('echoRequest', () => {
        let name = 'name';
        let echo = true;
        beforeEach(() => {
            client.echoRequest(name, echo);
        });
        it('sets the mock echo indicator', () =>
            sinon.assert.calledWith(updateMockFn, {name: name, echo: echo}));

        afterEach(() => {
            updateMockFn.reset();
        });
    });

    describe('updateMock', () => {
        let name = 'name';
        let echo = true;
        let scenario = 'scenario';
        let delay = 1000;
        beforeEach(() => {
            updateMockFn.callThrough();
            client.updateMock({name: name, scenario: scenario, delay: delay, echo: echo});
        });
        it('calls updateMockRequest', () =>
            sinon.assert.calledWith(updateMockRequestFn, {name: name, scenario: scenario, delay: delay, echo: echo}));

        afterEach(() => {
            updateMockFn.reset();
            updateMockRequestFn.reset();
        });
    });

    describe('setVariable', () => {
        beforeEach(() => {
            client.setVariable('one', 'first');
        });
        it('sets the variable', () =>
            sinon.assert.calledWith(setVariablesRequestFn, {one: 'first'}));

        afterEach(() => {
            setVariablesRequestFn.reset();
        });
    });

    describe('setVariable', () => {
        let variables: any;
        beforeEach(() => {
            variables = {'one': 'first', 'two': 'second'};
            client.setVariables(variables);
        });
        it('sets the variables', () =>
            sinon.assert.calledWith(setVariablesRequestFn, variables));

        afterEach(() => {
            setVariablesRequestFn.reset();
        });
    });

    describe('deleteVariable', () => {
        let key: any;
        beforeEach(() => {
            key = 'one';
            client.deleteVariable(key);
        });
        it('deletes the variable', () =>
            sinon.assert.calledWith(deleteVariableRequestFn, key));

        afterEach(() => {
            setVariablesRequestFn.reset();
        });
    });

    describe('resetMocksToDefault', () => {
        beforeEach(() => {
            client.resetMocksToDefault();
        });
        it('deletes the variable', () =>
            sinon.assert.calledWith(performActionRequestFn, {action: 'defaults'}));

        afterEach(() => {
            performActionRequestFn.reset();
        });
    });

    describe('setMocksToPassThrough', () => {
        beforeEach(() => {
            client.setMocksToPassThrough();
        });
        it('deletes the variable', () =>
            sinon.assert.calledWith(performActionRequestFn, {action: 'passThroughs'}));

        afterEach(() => {
            performActionRequestFn.reset();
        });
    });

    describe('request', () => {
        describe('use promise', () => {
            beforeEach(() => {
                client.usePromise = true;
            });
            it('returns a promise', () => expect(client._request(() => {
            }) instanceof Promise).toBe(true));
        });

        describe('use promise === false', () => {
            beforeEach(() => {
                client.usePromise = false;
            });
            it('returns a  protractor.promise.defer', () => expect(client._request(() => {
            }) === deferredPromise).toBe(true));
        });
    });

    afterAll(() => {
        updateMockFn.restore();
        updateMockRequestFn.restore();
        setVariablesRequestFn.restore();
        deleteVariableRequestFn.restore();
        performActionRequestFn.restore();
    });
});
