import Mock from '../tasks/mock';
import Preset from '../tasks/preset';
import * as http from 'http';
import {httpMethods} from './http';
import ProtractorGetMocksHandler from './api/mocks/protractor/getMocksHandler';
import RuntimeGetMocksHandler from './api/mocks/runtime/getMocksHandler';
import ProtractorSetMocksToPassThroughsHandler from './api/mocks/protractor/setMocksToPassThroughsHandler';
import ProtractorRecordResponseHandler from './api/mocks/protractor/recordResponseHandler';
import ProtractorResetMocksToDefaultsHandler from './api/mocks/protractor/resetMocksToDefaultsHandler';
import RuntimeResetMocksToDefaultsHandler from './api/mocks/runtime/resetMocksToDefaultsHandler';
import RuntimeSetMocksToPassThroughsHandler from './api/mocks/runtime/setMocksToPassThroughsHandler';
import RuntimeRecordResponseHandler from './api/mocks/runtime/recordResponseHandler';
import GetPresetsHandler from './api/presets/getPresetsHandler';
import Registry from './registry';
import ProtractorUpdateMockHandler from './api/mocks/protractor/updateMockHandler';
import RuntimeUpdateMockHandler from './api/mocks/runtime/updateMockHandler';
import ProtractorDeleteVariableHandler from './api/variables/protractor/deleteVariableHandler';
import ProtractorNgApimockHandler from './protractor/ngApimockHandler';
import ProtractorAddOrUpdateVariableHandler from './api/variables/protractor/addOrUpdateVariableHandler';
import ProtractorGetVariablesHandler from './api/variables/protractor/getVariablesHandler';
import RuntimeAddOrUpdateVariableHandler from './api/variables/runtime/addOrUpdateVariableHandler';
import RuntimeGetVariablesHandler from './api/variables/runtime/getVariablesHandler';
import RuntimeDeleteVariableHandler from './api/variables/runtime/deleteVariableHandler';
import RuntimeNgApimockHandler from './runtime/ngApimockHandler';
import DELETE = httpMethods.DELETE;
import PUT = httpMethods.PUT;
import GET = httpMethods.GET;

(function () {
    'use strict';

    (module).exports = {
        ngApimockRequest: ngApimockRequest,
        registerMocks: registerMocks,
        registerPresets: registerPresets,
        updateMock: updateMock
    };

    const registry: Registry = new Registry(),
        handlers = {
            protractor: {
                updateMockHandler: new ProtractorUpdateMockHandler(),
                getMocksHandler: new ProtractorGetMocksHandler(),
                resetMocksToDefaultsHandler: new ProtractorResetMocksToDefaultsHandler(),
                setMocksToPassThroughsHandler: new ProtractorSetMocksToPassThroughsHandler(),
                recordResponseHandler: new ProtractorRecordResponseHandler(),
                getPresetsHandler: new GetPresetsHandler(),
                addOrUpdateVariableHandler: new ProtractorAddOrUpdateVariableHandler(),
                getVariablesHandler: new ProtractorGetVariablesHandler(),
                deleteVariableHandler: new ProtractorDeleteVariableHandler(),
                ngApimockHandler: new ProtractorNgApimockHandler()
            },
            runtime: {
                updateMockHandler: new RuntimeUpdateMockHandler(),
                getMocksHandler: new RuntimeGetMocksHandler(),
                resetMocksToDefaultsHandler: new RuntimeResetMocksToDefaultsHandler(),
                setMocksToPassThroughsHandler: new RuntimeSetMocksToPassThroughsHandler(),
                recordResponseHandler: new RuntimeRecordResponseHandler(),
                getPresetsHandler: new GetPresetsHandler(),
                addOrUpdateVariableHandler: new RuntimeAddOrUpdateVariableHandler(),
                getVariablesHandler: new RuntimeGetVariablesHandler(),
                deleteVariableHandler: new RuntimeDeleteVariableHandler(),
                ngApimockHandler: new RuntimeNgApimockHandler()
            }
        };

    /**
     * The connect middleware for handeling the mocking
     * @param request The http request.
     * @param response The http response.
     * @param next The next middleware.
     */
    function ngApimockRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function): void {
        const ngapimockId = _ngApimockId(request.headers),
            type = ngapimockId !== undefined ? 'protractor' : 'runtime';

        if (request.url === '/ngapimock/mocks/record' && request.method === PUT) {
            handlers[type].recordResponseHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else if (request.url === '/ngapimock/mocks' && request.method === GET) {
            handlers[type].getMocksHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else if (request.url === '/ngapimock/mocks' && request.method === PUT) {
            handlers[type].updateMockHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else if (request.url === '/ngapimock/mocks/defaults' && request.method === PUT) {
            handlers[type].resetMocksToDefaultsHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else if (request.url === '/ngapimock/mocks/passthroughs' && request.method === PUT) {
            handlers[type].setMocksToPassThroughsHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else if (request.url === '/ngapimock/presets' && request.method === GET) {
            handlers[type].getPresetsHandler.handleRequest(request, response, next, registry);
        } else if (request.url === '/ngapimock/variables' && request.method === GET) {
            handlers[type].getVariablesHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else if (request.url === '/ngapimock/variables' && request.method === PUT) {
            handlers[type].addOrUpdateVariableHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else if (new RegExp('/ngapimock/variables/.*').exec(request.url) !== null && request.method === DELETE) {
            handlers[type].deleteVariableHandler.handleRequest(request, response, next, registry, ngapimockId);
        } else {
            handlers[type].ngApimockHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
    }

    /**
     * Registers the given mocks.
     * @param mocks The mocks.
     */
    function registerMocks(mocks: Mock[]) {
        mocks.forEach(mock =>
            _handleMock(mock, `Mock with identifier '%s' already exists. Overwriting existing mock.`));
    }

    /**
     * Update the given mock.
     * @param mock The mock.
     */
    function updateMock(mock: Mock): void {
        _handleMock(mock, `Mock with identifier '%s' already exists. Updating existing mock.`);
    }

    function _handleMock(mock: Mock, warning: string) {
        mock.identifier = (mock.name ? mock.name : mock.expression.toString() + '$$' + mock.method);

        const match = registry.mocks.filter(_mock => mock.identifier === _mock.identifier)[0],
            index = registry.mocks.indexOf(match);

        if (index > -1) { // exists so update
            console.warn(warning, mock.identifier);
            registry.mocks[index] = mock;
        } else { // add
            registry.mocks.push(mock);
        }

        const _default = Object.keys(mock.responses).filter(key => !!mock.responses[key]['default'])[0];
        if (_default !== undefined) {
            registry.defaults[mock.identifier] = _default;
            registry.selections[mock.identifier] = _default;
        }
    }

    /**
     * Get the ngApimockId.
     * @param headers The request headers.
     * @returns {*}
     */
    function _ngApimockId(headers: any) {
        let ngApimockId;
        const header = headers.ngapimockid,
            cookie = _getNgApimockIdCookie(headers.cookie);

        if (header !== undefined) {
            ngApimockId = header;
        } else if (cookie !== undefined) {
            ngApimockId = cookie;
        }
        return ngApimockId;
    }

    /**
     * Get the ngApimockId from the given cookies.
     * @param cookies The cookies.
     * @returns {*}
     */
    function _getNgApimockIdCookie(cookies: string) {
        return cookies && cookies
                .split(';')
                .map(cookie => {
                    const parts = cookie.split('=');
                    return {
                        key: parts.shift().trim(),
                        value: decodeURI(parts.join('='))
                    };
                })
                .filter(cookie => cookie.key === 'ngapimockid')
                .map(cookie => cookie.value)[0];
    }
})();
