import * as sinon from 'sinon';

import BaseApimockClient from './base.client';
import {HttpStatusCode} from '../core/middleware/http';

describe('BaseApimockClient', () => {
    const BASE_URL = 'http://localhost:9000';
    let client: BaseApimockClient;
    let invokeFn: sinon.SinonStub;
    let resolveFn: sinon.SinonStub;
    let rejectFn: sinon.SinonStub;
    let request: sinon.SinonStub;
    let requestDoneFn: sinon.SinonStub;

    beforeAll(() => {
        client = new BaseApimockClient(BASE_URL);
        invokeFn = sinon.stub(BaseApimockClient.prototype, 'invoke');
        resolveFn = sinon.stub();
        rejectFn = sinon.stub();
        request = sinon.stub();
        requestDoneFn = sinon.stub();
    });
    describe('constructor', () => {
        it('sets the apimock id', () =>
            expect(client.apimockId).toBeDefined());

        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe(BASE_URL + '/ngapimock'));

        it('sets the request', () =>
            expect(client.request).toBeDefined());
    });

    describe('updateMockRequest', () => {
        let payload: any;
        beforeEach(() => {
            payload = {name: 'name', scenario: 'scenario'};
            client.updateMockRequest(payload, resolveFn, rejectFn);
        });
        it('calls the api', () =>
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/mocks', 'PUT', payload, resolveFn, rejectFn));

        afterEach(() => {
            invokeFn.reset();
            resolveFn.reset();
            rejectFn.reset();
        });
    });

    describe('setVariablesRequest', () => {
        let payload: any;
        beforeEach(() => {
            payload = {'one': 'first', 'two': 'second'};
            client.setVariablesRequest(payload, resolveFn, rejectFn);
        });
        it('calls the api', () =>
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/variables', 'PUT', payload, resolveFn, rejectFn));

        afterEach(() => {
            invokeFn.reset();
            resolveFn.reset();
            rejectFn.reset();
        });
    });

    describe('deleteVariableRequest', () => {
        let key: string;
        beforeEach(() => {
            key = 'one';
            client.deleteVariableRequest(key, resolveFn, rejectFn);
        });
        it('calls the api', () =>
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/variables/one', 'DELETE', {}, resolveFn, rejectFn));

        afterEach(() => {
            invokeFn.reset();
            resolveFn.reset();
            rejectFn.reset();
        });
    });

    describe('performActionRequest', () => {
        let payload: any;
        beforeEach(() => {
            payload = {action: 'action'};
            client.performActionRequest(payload, resolveFn, rejectFn);
        });
        it('calls the api', () =>
            sinon.assert.calledWith(invokeFn, BASE_URL + '/ngapimock/actions', 'PUT', payload, resolveFn, rejectFn));

        afterEach(() => {
            invokeFn.reset();
            resolveFn.reset();
            rejectFn.reset();
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
        it('calls the api', () => {
            sinon.assert.calledWith(request, method, url, {
                json: payload, headers: {
                    'Content-Type': 'application/json',
                    'cookie': `apimockid=${client.apimockId}`
                }
            });
        });

        describe('status code OK', () => {
            it('calls resolve', () => {
                requestDoneFn.args[0][0]({statusCode: HttpStatusCode.OK});
                sinon.assert.called(resolveFn);
            });
        });

        describe('status code not OK', () => {
            it('calls reject', () => {
                requestDoneFn.args[0][0]({statusCode: HttpStatusCode.CONFLICT});
                sinon.assert.called(rejectFn);
            });
        });

        afterEach(() => {
            invokeFn.reset();
            resolveFn.reset();
            rejectFn.reset();
        });
    });
});
