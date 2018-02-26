import * as sinon from 'sinon';

import BaseApimockClient from './base.client';
import {HttpStatusCode} from '../core/middleware/http';

class TestClient extends BaseApimockClient {
    wrapAsPromise(func: Function): Promise<any> {
        return undefined;
    }

}

describe('BaseApimockClient', () => {
    const BASE_URL = 'http://localhost:9000';
    let client: BaseApimockClient;
    let invokeFn: sinon.SinonStub;
    let resolveFn: sinon.SinonStub;
    let rejectFn: sinon.SinonStub;
    let request: sinon.SinonStub;
    let requestDoneFn: sinon.SinonStub;
    let wrapAsPromiseFn: sinon.SinonStub;
    let updateMockFn: sinon.SinonStub;
    let updateMockRequestFn: sinon.SinonStub;
    let setVariablesFn: sinon.SinonStub;
    let setVariablesRequestFn: sinon.SinonStub;
    let deleteVariableFn: sinon.SinonStub;
    let deleteVariableRequestFn: sinon.SinonStub;
    let getMocksFn: sinon.SinonStub;
    let getMocksRequestFn: sinon.SinonStub;
    let getVariablesFn: sinon.SinonStub;
    let getVariablesRequestFn: sinon.SinonStub;
    let resetMocksToDefaultFn: sinon.SinonStub;
    let setMocksToPassThroughFn: sinon.SinonStub;
    let performActionRequestFn: sinon.SinonStub;

    beforeAll(() => {
        client = new TestClient(BASE_URL);
        invokeFn = sinon.stub(BaseApimockClient.prototype, 'invoke');
        updateMockFn = sinon.stub(BaseApimockClient.prototype, 'updateMock');
        updateMockRequestFn = sinon.stub(BaseApimockClient.prototype, '_updateMockRequest');
        setVariablesFn = sinon.stub(BaseApimockClient.prototype, 'setVariables');
        setVariablesRequestFn = sinon.stub(BaseApimockClient.prototype, '_setVariablesRequest');
        deleteVariableFn = sinon.stub(BaseApimockClient.prototype, 'deleteVariable');
        deleteVariableRequestFn = sinon.stub(BaseApimockClient.prototype, '_deleteVariableRequest');
        getMocksFn = sinon.stub(BaseApimockClient.prototype, 'getMocks');
        getMocksRequestFn = sinon.stub(BaseApimockClient.prototype, '_getMocksRequest');
        getVariablesFn = sinon.stub(BaseApimockClient.prototype, 'getVariables');
        getVariablesRequestFn = sinon.stub(BaseApimockClient.prototype, '_getVariablesRequest');
        resetMocksToDefaultFn = sinon.stub(BaseApimockClient.prototype, 'resetMocksToDefault');
        setMocksToPassThroughFn = sinon.stub(BaseApimockClient.prototype, 'setMocksToPassThrough');
        performActionRequestFn = sinon.stub(BaseApimockClient.prototype, '_performActionRequest');
        resolveFn = sinon.stub();
        rejectFn = sinon.stub();
        request = sinon.stub();
        requestDoneFn = sinon.stub();
        wrapAsPromiseFn = sinon.stub(TestClient.prototype, 'wrapAsPromise');
    });

    describe('constructor', () => {
        it('sets the apimock id', () =>
            expect(client.apimockId).toBeDefined());

        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe(BASE_URL + '/ngapimock'));

        it('sets the request', () =>
            expect(client.request).toBeDefined());
    });

    describe('getMocks', () => {
        it('gets the mocks', () => {
            getMocksFn.callThrough();
            wrapAsPromiseFn.resolves(Promise.resolve());

            client.getMocks();

            sinon.assert.called(wrapAsPromiseFn);
            wrapAsPromiseFn.getCall(0).args[0]();
            sinon.assert.called(getMocksRequestFn);
        });

        afterEach(() => {
            getMocksFn.reset();
            getMocksRequestFn.reset();
            wrapAsPromiseFn.reset();
        });
    });

    describe('getMocksRequest', () => {
        it('calls the api', () => {
            getMocksRequestFn.callThrough();

            client._getMocksRequest(resolveFn, rejectFn);
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/mocks', 'GET', {}, sinon.match.func, rejectFn);

            invokeFn.getCall(0).args[3]({body: '{"x":"x"}'});
            sinon.assert.calledWith(resolveFn, {x: 'x'}); // convert to json object
        });

        afterEach(() => {
            getMocksRequestFn.reset();
            invokeFn.reset();
            resolveFn.reset();
        });
    });

    describe('getVariables', () => {
        it('gets the variables', () => {
            getVariablesFn.callThrough();
            wrapAsPromiseFn.resolves(Promise.resolve());

            client.getVariables();

            sinon.assert.called(wrapAsPromiseFn);
            wrapAsPromiseFn.getCall(0).args[0]();
            sinon.assert.called(getVariablesRequestFn);
        });

        afterEach(() => {
            getVariablesFn.reset();
            getVariablesRequestFn.reset();
            wrapAsPromiseFn.reset();
        });
    });

    describe('getVariablesRequest', () => {
        it('calls the api', () => {
            getVariablesRequestFn.callThrough();

            client._getVariablesRequest(resolveFn, rejectFn);
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/variables', 'GET', {}, sinon.match.func, rejectFn);

            invokeFn.getCall(0).args[3]({body: '{"x":"x"}'});
            sinon.assert.calledWith(resolveFn, {x: 'x'}); // convert to json object
        });

        afterEach(() => {
            getVariablesRequestFn.reset();
            invokeFn.reset();
            resolveFn.reset();
        });
    });

    describe('selectScenario', () => {
        it('sets the mock scenario', () => {
            const name = 'name';
            const scenario = 'scenario';
            client.selectScenario(name, scenario);
            sinon.assert.calledWith(updateMockFn, {name: name, scenario: scenario});
        });

        afterEach(() => {
            updateMockFn.reset();
        });
    });

    describe('delayResponse', () => {
        it('sets the mock response delay time', () => {
            const name = 'name';
            const delay = 1000;
            client.delayResponse(name, delay);
            sinon.assert.calledWith(updateMockFn, {name: name, delay: delay});
        });

        afterEach(() => {
            updateMockFn.reset();
        });
    });

    describe('echoRequest', () => {
        it('sets the mock echo indicator', () => {
            const name = 'name';
            const echo = true;
            client.echoRequest(name, echo);
            sinon.assert.calledWith(updateMockFn, {name: name, echo: echo});
        });

        afterEach(() => {
            updateMockFn.reset();
        });
    });

    describe('updateMock', () => {
        it('calls updateMockRequest', () => {
            const payload = {name: 'name', scenario: 'scenario', delay: 1000, echo: true};
            updateMockFn.callThrough();
            wrapAsPromiseFn.resolves(Promise.resolve());

            client.updateMock(payload);

            sinon.assert.called(wrapAsPromiseFn);
            wrapAsPromiseFn.getCall(0).args[0]();
            sinon.assert.called(updateMockRequestFn);
        });

        afterEach(() => {
            updateMockFn.reset();
            updateMockRequestFn.reset();
            wrapAsPromiseFn.reset();
        });
    });

    describe('updateMockRequest', () => {
        it('calls the api', () => {
            updateMockRequestFn.callThrough();
            const payload = {name: 'name', scenario: 'scenario'};
            client._updateMockRequest(payload, resolveFn, rejectFn);
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/mocks', 'PUT', payload, resolveFn, rejectFn);
        });

        afterEach(() => {
            updateMockRequestFn.reset();
            invokeFn.reset();
        });
    });

    describe('setVariable', () => {
        it('sets the variable', () => {
            client.setVariable('one', 'first');
            sinon.assert.calledWith(setVariablesFn, {one: 'first'});
        });

        afterEach(() => {
            setVariablesFn.reset();
        });
    });

    describe('setVariables', () => {
        it('sets the variables', () => {
            const variables = {'one': 'first', 'two': 'second'};
            setVariablesFn.callThrough();
            wrapAsPromiseFn.resolves(Promise.resolve());

            client.setVariables(variables);

            sinon.assert.called(wrapAsPromiseFn);
            wrapAsPromiseFn.getCall(0).args[0]();
            sinon.assert.calledWith(setVariablesRequestFn, variables);
        });

        afterEach(() => {
            setVariablesFn.reset();
            setVariablesRequestFn.reset();
            wrapAsPromiseFn.reset();
        });
    });

    describe('setVariablesRequest', () => {
        it('calls the api', () => {
            setVariablesRequestFn.callThrough();
            const payload = {'one': 'first', 'two': 'second'};
            client._setVariablesRequest(payload, resolveFn, rejectFn);
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/variables', 'PUT', payload, resolveFn, rejectFn);
        });

        afterEach(() => {
            setVariablesRequestFn.reset();
            invokeFn.reset();
        });
    });

    describe('deleteVariable', () => {
        it('deletes the variable', () => {
            const key = 'one';
            deleteVariableFn.callThrough();
            wrapAsPromiseFn.resolves(Promise.resolve());

            client.deleteVariable(key);

            sinon.assert.called(wrapAsPromiseFn);
            wrapAsPromiseFn.getCall(0).args[0]();
            sinon.assert.calledWith(deleteVariableRequestFn, key);
        });

        afterEach(() => {
            deleteVariableFn.reset();
            deleteVariableRequestFn.reset();
            wrapAsPromiseFn.reset();
        });
    });

    describe('deleteVariableRequest', () => {
        it('calls the api', () => {
            deleteVariableRequestFn.callThrough();
            const key = 'one';
            client._deleteVariableRequest(key, resolveFn, rejectFn);
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/variables/one', 'DELETE', {}, resolveFn, rejectFn);
        });

        afterEach(() => {
            deleteVariableRequestFn.reset();
            invokeFn.reset();
        });
    });

    describe('resetMocksToDefault', () => {
        it('resets the mocks to defaults', () => {
            resetMocksToDefaultFn.callThrough();
            wrapAsPromiseFn.resolves(Promise.resolve());

            client.resetMocksToDefault();

            sinon.assert.called(wrapAsPromiseFn);
            wrapAsPromiseFn.getCall(0).args[0]();
            sinon.assert.called(performActionRequestFn);
        });

        afterEach(() => {
            resetMocksToDefaultFn.reset();
            performActionRequestFn.reset();
            wrapAsPromiseFn.reset();
        });
    });

    describe('setMocksToPassThrough', () => {
        it('sets mocks to passThrough', () => {
            setMocksToPassThroughFn.callThrough();
            wrapAsPromiseFn.resolves(Promise.resolve());

            client.setMocksToPassThrough();

            sinon.assert.called(wrapAsPromiseFn);
            wrapAsPromiseFn.getCall(0).args[0]();
            sinon.assert.calledWith(performActionRequestFn);
        });

        afterEach(() => {
            setMocksToPassThroughFn.reset();
            performActionRequestFn.reset();
            wrapAsPromiseFn.reset();
        });
    });

    describe('performActionRequest', () => {
        it('calls the api', () => {
            performActionRequestFn.callThrough()
            const payload = {action: 'action'};
            client._performActionRequest(payload, resolveFn, rejectFn);
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/actions', 'PUT', payload, resolveFn, rejectFn);
        });

        afterEach(() => {
            performActionRequestFn.reset();
            invokeFn.reset();
        });
    });

    describe('invoke', () => {
        let url: string;
        let method: string;
        let payload: any;

        beforeEach(() => {
            url = 'url';
            method = 'method';
            payload = {'one': 'one'};
            client.request = request;
            request.returns({done: requestDoneFn})
            invokeFn.callThrough();
            client.invoke(url, method, payload, resolveFn, rejectFn);
        });
        it('calls the api', () =>
            sinon.assert.calledWith(request, method, url, {
                json: payload, headers: {
                    'Content-Type': 'application/json',
                    'cookie': `apimockid=${client.apimockId}`
                }
            }));

        describe('status code OK', () =>
            it('calls resolve', () => {
                requestDoneFn.args[0][0]({statusCode: HttpStatusCode.OK});
                sinon.assert.called(resolveFn);
            }));

        describe('status code not OK', () =>
            it('calls reject', () => {
                requestDoneFn.args[0][0]({statusCode: HttpStatusCode.CONFLICT});
                sinon.assert.called(rejectFn);
            }));

        afterEach(() => {
            invokeFn.reset();
            resolveFn.reset();
            rejectFn.reset();
        });
    });

    afterAll(() => {
        updateMockFn.restore();
        updateMockRequestFn.restore();
        setVariablesFn.restore();
        setVariablesRequestFn.restore();
        deleteVariableFn.restore();
        deleteVariableRequestFn.restore();
        getMocksFn.restore();
        getMocksRequestFn.restore();
        getVariablesFn.restore();
        getVariablesRequestFn.restore();
        resetMocksToDefaultFn.restore();
        setMocksToPassThroughFn.restore();
        performActionRequestFn.restore();
    });
});
