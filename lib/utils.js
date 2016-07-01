(function () {
    'use strict';
    var getMocksHandler = require('./api/mocks/getMocksHandler.js'),
        updateMockHandler = require('./api/mocks/updateMockHandler.js'),
        defaultMockHandler = require('./api/mocks/defaultMockHandler.js'),
        passThroughMockHandler = require('./api/mocks/passThroughMockHandler.js'),

        recordHandler = require('./api/mocks/recordHandler.js'),

        getVariablesHandler = require('./api/variables/getVariablesHandler.js'),
        addOrUpdateVariableHandler = require('./api/variables/addOrUpdateVariableHandler.js'),
        deleteVariableHandler = require('./api/variables/deleteVariableHandler.js'),

        ngApimockHandler = require('./ngApimockHandler.js'),

        config = {
            mocks: [],
            selections: {},
            sessions: {},
            defaults: {},
            variables: {},
            record: false
        };

    /**
     * Register all the given mocks.
     * @param mocks The mocks.
     *
     * #1 Check if the mock you're trying to add isn't present already. If so replace the old with the new,
     * else just add the mock to the list of mocks.
     * #2 Check which scenario is the default and put it into the configuration
     */
    function registerMocks(mocks) {
        mocks.forEach(function (mock) {
            mock.identifier = (mock.name ? mock.name : mock.expression.toString() + '$$' + mock.method);

            // #1
            var index = config.mocks.findIndex(function (configMock) {
                return configMock.identifier === mock.identifier;
            });

            if (index > -1) { // exists so update
                config.mocks[index] = mock;
            } else { // add
                config.mocks.push(mock);
            }

            // #2
            for (var key in mock.responses) {
                if (mock.responses.hasOwnProperty(key)) {
                    if (!!mock.responses[key]['default']) {
                        config.selections[mock.identifier] = key;
                        config.defaults[mock.identifier] = key;
                        break;
                    }
                }
            }
        });
    }

    /**
     * The connect middleware for handeling the mocking
     * @param request The http request.
     * @param response The http response.
     * @param next The next middleware.
     */
    function ngApiMockRequest(request, response, next) {
        if (request.url === '/ngapimock/mocks/record' && request.method === 'PUT') {
            recordHandler.handleRequest(request, response, config);
        } else if (request.url === '/ngapimock/mocks' && request.method === 'GET') {
            getMocksHandler.handleRequest(request, response, config);
        } else if (request.url === '/ngapimock/mocks' && request.method === 'PUT') {
            updateMockHandler.handleRequest(request, response, config);
        } else if (request.url === '/ngapimock/mocks/defaults' && request.method === 'PUT') {
            defaultMockHandler.handleRequest(request, response, config);
        } else if (request.url === '/ngapimock/mocks/passthroughs' && request.method === 'PUT') {
            passThroughMockHandler.handleRequest(request, response, config);
        } else if (request.url === '/ngapimock/variables' && request.method === 'GET') {
            getVariablesHandler.handleRequest(request, response, config);
        } else if (request.url === '/ngapimock/variables' && request.method === 'PUT') {
            addOrUpdateVariableHandler.handleRequest(request, response, config);
        } else if (new RegExp('/ngapimock/variables/.*').exec(request.url) !== null && request.method === 'DELETE') {
            deleteVariableHandler.handleRequest(request, response, config);
        } else {
            ngApimockHandler.handleRequest(request, response, next, config);
        }
    }

    module.exports = {
        ngApimockRequest: ngApiMockRequest,
        registerMocks: registerMocks
    };
})();
