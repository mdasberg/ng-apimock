import 'reflect-metadata';
import {Container} from 'inversify';

import * as sinon from 'sinon';

import ActionHandler from './action.handler';
import MocksState from '../../../state/mocks.state';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

describe('ActionHandler', () => {
    const DEFAULTS = 'defaults';
    const PASS_THROUGHS = 'passThroughs';
    let actionHandler: ActionHandler;
    let mocksState: MocksState;

    let nextFn: sinon.SinonStub;
    let requestOnFn: sinon.SinonStub;
    let responseWriteHeadFn: sinon.SinonStub;
    let responseEndFn: sinon.SinonStub;
    let mocksStateGetMatchingStateFn: sinon.SinonStub;
    let mocksStateSetToDefaultsFn: sinon.SinonStub;
    let mocksStateSetToPassThroughsFn: sinon.SinonStub;

    let container: Container;

    const APIMOCK_ID = 'apimockId';

    beforeAll(() => {
        container = new Container();
        container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();
        container.bind<ActionHandler>('ActionHandler').to(ActionHandler);

        nextFn = sinon.stub();
        requestOnFn = sinon.stub();
        responseWriteHeadFn = sinon.stub();
        responseEndFn = sinon.stub();

        mocksState = container.get<MocksState>('MocksState');
        actionHandler = container.get<ActionHandler>('ActionHandler');

        mocksStateGetMatchingStateFn = sinon.stub(MocksState.prototype, <any>'getMatchingState');
        mocksStateSetToDefaultsFn = sinon.stub(MocksState.prototype, <any>'setToDefaults');
        mocksStateSetToPassThroughsFn = sinon.stub(MocksState.prototype, <any>'setToPassThroughs');
    });

    describe('handle', () => {
        let request: any;
        let response: any;
        let payload: any;
        let matchingState: any;

        beforeEach(() => {
            request = {
                url: '/action/url',
                on: requestOnFn
            };
            response = {
                writeHead: responseWriteHeadFn,
                end: responseEndFn
            } as any;
        });

        describe('defaults action', () => {
            beforeEach(() => {
                payload = {action: DEFAULTS};
                mocksStateGetMatchingStateFn.returns(matchingState);
                actionHandler.handle(request, response, nextFn, {
                    id: APIMOCK_ID, payload: payload
                });
            });

            it('sets the defaults', () => {
                sinon.assert.calledWith(mocksStateSetToDefaultsFn, APIMOCK_ID);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
            });

            afterEach(() => {
                mocksStateGetMatchingStateFn.reset();
                mocksStateSetToDefaultsFn.reset();
                mocksStateSetToPassThroughsFn.reset();
            });
        });

        describe('passThroughs action', () => {
            beforeEach(() => {
                payload = {action: PASS_THROUGHS};
                actionHandler.handle(request, response, nextFn, {
                    id: APIMOCK_ID, payload: payload
                });
            });

            it('sets the passThroughs', () => {
                sinon.assert.calledWith(mocksStateSetToPassThroughsFn, APIMOCK_ID);
                sinon.assert.calledWith(responseWriteHeadFn, HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                sinon.assert.called(responseEndFn);
            });

            afterEach(() => {
                mocksStateGetMatchingStateFn.reset();
                mocksStateSetToDefaultsFn.reset();
                mocksStateSetToPassThroughsFn.reset();
            });
        });
    });

    afterAll(() => {
        mocksStateGetMatchingStateFn.restore();
        mocksStateSetToDefaultsFn.restore();
        mocksStateSetToPassThroughsFn.restore();
    });
});