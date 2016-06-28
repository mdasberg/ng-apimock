(function () {
    'use strict';
    var getMocksHandler = require('./api/mocks/getMocksHandler.js'),
            updateMockHandler = require('./api/mocks/updateMockHandler.js'),
            recordHandler = require('./api/mocks/recordHandler.js'),
            resetMockHandler = require('./api/mocks/resetMockHandler.js'),
            defaultMockHandler = require('./api/mocks/defaultMockHandler.js'),
            passThroughMockHandler = require('./api/mocks/passThroughMockHandler.js'),
            getVariablesHandler = require('./api/variables/getVariablesHandler.js'),
            addOrUpdateVariableHandler = require('./api/variables/addOrUpdateVariableHandler.js'),
            deleteVariableHandler = require('./api/variables/deleteVariableHandler.js'),
            ngApimockHandler = require('./ngApimockHandler.js'),
            http = require('http'),
            MAX_RECORDING = 5,
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
     */
    function registerMocks(mocks) {
        mocks.forEach(function (mock) {
            mock.identifier = (mock.name ? mock.name : mock.expression.toString() + '$$' + mock.method);
            config.mocks.push(mock);

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
        var matchingMock = config.mocks.filter(function (mock) {
            var expressionMatches = new RegExp(mock.expression).exec(request.url) !== null;
            var methodMatches = mock.method === request.method;
            return expressionMatches && methodMatches;
        })[0];
        if (matchingMock && config.record && !request.headers.record) {
            recordRequest(request, response, matchingMock);
        } else {
            handleRequest(request, response, next);
        }
    }

    function recordRequest(request, response, mock) {
        var hdrs = request.headers;
        hdrs.record = 'off';
        var options = {
            host: request.headers.host.split(':')[0],
            port: request.headers.host.split(':')[1],
            path: request.url,
            method: request.method,
            headers: hdrs
        };
        var payload;
        request.on('data', function (rawData) {
            payload = rawData.toString();
        });
        var req = http.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var result = {};
                result.data = chunk;
                result.payload = payload;
                result.datetime = (new Date()).getTime();
                result.method = request.method;
                result.url = request.url;
                result.statusCode = res.statusCode;
                if (mock.recordings) {
                    if (mock.recordings.length > MAX_RECORDING) {
                        mock.recordings.shift();
                    }
                    mock.recordings.push(result);
                } else {
                    mock.recordings = [];
                    mock.recordings.push(result);
                }

                response.end(chunk);
            });
        });
        req.on('error', function (e) {
            console.log('problem with proxy request');
            console.log(e);
            response.end();
        });
        req.end();
    }

    function handleRequest(request, response, next) {
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
