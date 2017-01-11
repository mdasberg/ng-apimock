"use strict";
const registry_1 = require("./registry");
const http_1 = require("./http");
const ProtractorUpdateMockHandler_1 = require("./api/mocks/ProtractorUpdateMockHandler");
const RuntimeUpdateMockHandler_1 = require("./api/mocks/RuntimeUpdateMockHandler");
const ProtractorGetMocksHandler_1 = require("./api/mocks/ProtractorGetMocksHandler");
const RuntimeGetMocksHandler_1 = require("./api/mocks/RuntimeGetMocksHandler");
const runtimeResetMocksToDefaultsHandler_1 = require("./api/mocks/runtimeResetMocksToDefaultsHandler");
const protractorResetMocksToDefaultsHandler_1 = require("./api/mocks/protractorResetMocksToDefaultsHandler");
const protractorSetMocksToPassThroughsHandler_1 = require("./api/mocks/protractorSetMocksToPassThroughsHandler");
const runtimeSetMocksToPassThroughsHandler_1 = require("./api/mocks/runtimeSetMocksToPassThroughsHandler");
const runtimeRecordResponseHandler_1 = require("./api/mocks/runtimeRecordResponseHandler");
const protractorRecordResponseHandler_1 = require("./api/mocks/protractorRecordResponseHandler");
const protractorAddOrUpdateVariableHandler_1 = require("./api/variables/protractorAddOrUpdateVariableHandler");
const runtimeAddOrUpdateVariableHandler_1 = require("./api/variables/runtimeAddOrUpdateVariableHandler");
const runtimeGetVariablesHandler_1 = require("./api/variables/runtimeGetVariablesHandler");
const protractorGetVariablesHandler_1 = require("./api/variables/protractorGetVariablesHandler");
const runtimeDeleteVariableHandler_1 = require("./api/variables/runtimeDeleteVariableHandler");
const protractorDeleteVariableHandler_1 = require("./api/variables/protractorDeleteVariableHandler");
const runtimeNgApimockHandler_1 = require("./runtimeNgApimockHandler");
const protractorNgApimockHandler_1 = require("./protractorNgApimockHandler");
(function () {
    "use strict";
    (module).exports = {
        ngApimockRequest: ngApimockRequest,
        registerMocks: registerMocks
    };
    const registry = new registry_1.Registry(), handlers = {
        protractor: {
            updateMockHandler: new ProtractorUpdateMockHandler_1.ProtractorUpdateMockHandler(),
            getMocksHandler: new ProtractorGetMocksHandler_1.ProtractorGetMocksHandler(),
            resetMocksToDefaultsHandler: new protractorResetMocksToDefaultsHandler_1.ProtractorResetMocksToDefaultsHandler(),
            setMocksToPassThroughsHandler: new protractorSetMocksToPassThroughsHandler_1.ProtractorSetMocksToPassThroughsHandler(),
            recordResponseHandler: new protractorRecordResponseHandler_1.ProtractorRecordResponseHandler(),
            addOrUpdateVariableHandler: new protractorAddOrUpdateVariableHandler_1.ProtractorAddOrUpdateVariableHandler(),
            getVariablesHandler: new protractorGetVariablesHandler_1.ProtractorGetVariablesHandler(),
            deleteVariableHandler: new protractorDeleteVariableHandler_1.ProtractorDeleteVariableHandler(),
            ngApimockHandler: new protractorNgApimockHandler_1.ProtractorNgApimockHandler()
        },
        runtime: {
            updateMockHandler: new RuntimeUpdateMockHandler_1.RuntimeUpdateMockHandler(),
            getMocksHandler: new RuntimeGetMocksHandler_1.RuntimeGetMocksHandler(),
            resetMocksToDefaultsHandler: new runtimeResetMocksToDefaultsHandler_1.RuntimeResetMocksToDefaultsHandler(),
            setMocksToPassThroughsHandler: new runtimeSetMocksToPassThroughsHandler_1.RuntimeSetMocksToPassThroughsHandler(),
            recordResponseHandler: new runtimeRecordResponseHandler_1.RuntimeRecordResponseHandler(),
            addOrUpdateVariableHandler: new runtimeAddOrUpdateVariableHandler_1.RuntimeAddOrUpdateVariableHandler(),
            getVariablesHandler: new runtimeGetVariablesHandler_1.RuntimeGetVariablesHandler(),
            deleteVariableHandler: new runtimeDeleteVariableHandler_1.RuntimeDeleteVariableHandler(),
            ngApimockHandler: new runtimeNgApimockHandler_1.RuntimeNgApimockHandler()
        }
    };
    /**
     * The connect middleware for handeling the mocking
     * @param request The http request.
     * @param response The http response.
     * @param next The next middleware.
     */
    function ngApimockRequest(request, response, next) {
        const ngapimockId = _ngApimockId(request.headers), type = ngapimockId !== undefined ? 'protractor' : 'runtime';
        console.log(request.url + ' - ' + type + ' - ' + ngapimockId);
        if (request.url === '/ngapimock/mocks/record' && request.method === http_1.httpMethods.PUT) {
            handlers[type].recordResponseHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else if (request.url === '/ngapimock/mocks' && request.method === http_1.httpMethods.GET) {
            handlers[type].getMocksHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else if (request.url === '/ngapimock/mocks' && request.method === http_1.httpMethods.PUT) {
            handlers[type].updateMockHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else if (request.url === '/ngapimock/mocks/defaults' && request.method === http_1.httpMethods.PUT) {
            handlers[type].resetMocksToDefaultsHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else if (request.url === '/ngapimock/mocks/passthroughs' && request.method === http_1.httpMethods.PUT) {
            handlers[type].setMocksToPassThroughsHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else if (request.url === '/ngapimock/variables' && request.method === http_1.httpMethods.GET) {
            handlers[type].getVariablesHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else if (request.url === '/ngapimock/variables' && request.method === http_1.httpMethods.PUT) {
            handlers[type].addOrUpdateVariableHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else if (new RegExp('/ngapimock/variables/.*').exec(request.url) !== null && request.method === http_1.httpMethods.DELETE) {
            handlers[type].deleteVariableHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
        else {
            handlers[type].ngApimockHandler.handleRequest(request, response, next, registry, ngapimockId);
        }
    }
    function registerMocks(mocks) {
        mocks.forEach(mock => {
            mock.identifier = (mock.name ? mock.name : mock.expression.toString() + '$$' + mock.method);
            // #1
            const match = registry.mocks.filter(_mock => mock.identifier === _mock.identifier)[0], index = registry.mocks.indexOf(match);
            if (index > -1) {
                registry.mocks[index] = mock;
            }
            else {
                registry.mocks.push(mock);
            }
            const _default = Object.keys(mock.responses).find(key => !!mock.responses[key]['default']);
            if (_default !== undefined) {
                registry.defaults[mock.identifier] = _default;
                registry.selections[mock.identifier] = _default;
            }
        });
    }
    /**
     * Get the ngApimockId.
     * @param headers The request headers.
     * @returns {*}
     */
    function _ngApimockId(headers) {
        let ngApimockId;
        const header = headers.ngapimockid, cookie = _getNgApimockIdCookie(headers.cookie);
        if (header !== undefined) {
            ngApimockId = header;
        }
        else if (cookie !== undefined) {
            ngApimockId = cookie;
        }
        return ngApimockId;
    }
    /**
     * Get the ngApimockId from the given cookies.
     * @param cookies The cookies.
     * @returns {*}
     */
    function _getNgApimockIdCookie(cookies) {
        return cookies && cookies
            .split(';')
            .map(cookie => {
            let parts = cookie.split('=');
            return {
                key: parts.shift().trim(),
                value: decodeURI(parts.join('='))
            };
        })
            .filter(cookie => cookie.key === 'ngapimockid')
            .map(cookie => cookie.value)[0];
    }
})();
//# sourceMappingURL=utils.js.map