(function () {
    'use strict';

    var MEDIA_TYPE_APPLICATION_JSON = 'application/json',
        MEDIA_TYPE_APPLICATION_BINARY = 'application/octet-stream',
        DEFAULT_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_JSON},
        DEFAULT_BINARY_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_BINARY},
        MAX_RECORDING = 5,
        fs = require('fs'),
        http = require('http'),
        url = require('url');

    /**
     * Update the response data with the globally available variables.
     * @param data The data.
     * @param variables The variables.
     * @return updatedData The updated data.
     */
    function updateData(data, variables) {
        var json = JSON.stringify(data);
        Object.keys(variables).forEach(function (key) {
            if (variables.hasOwnProperty(key)) {
                json = json.replace(new RegExp("%%" + key + "%%", "g"), variables[key]);
            }
        });
        return JSON.parse(json);
    }

    /**
     * Get the mock matching the given request.
     * @param mocks The mocks.
     * @param request The http request.
     * @returns matchingMock The matching mock.
     */
    function getMatchingMock(mocks, request) {
        return mocks.filter(function (mock) {
            var expressionMatches = new RegExp(mock.expression).exec(request.url) !== null,
                methodMatches = mock.method === request.method;
            return expressionMatches && methodMatches;
        })[0];
    }

    /**
     * Stores the recording with the given mock.
     * @param payload The payload.
     * @param chunk The chunk.
     * @param request The http request.
     * @param statusCode The status code.
     * @param mock The mock.
     */
    function storeRecording(payload, chunk, request, statusCode, mock) {
        var result = {
            data: chunk.toString('utf8'),
            payload: payload,
            datetime: new Date().getTime(),
            method: request.method,
            url: request.url,
            statusCode: statusCode
        };

        if (mock.recordings) {
            if (mock.recordings.length > MAX_RECORDING) {
                mock.recordings.shift();
            }
        } else {
            mock.recordings = [];
        }
        mock.recordings.push(result);
    }

    /**
     * Get the JSONP callback name.
     * @param req The request.
     * @returns {*}
     */
    var getJsonCallbackName = function (req) {
        var url_parts = url.parse(req.url, true);

        if (!url_parts.query || !url_parts.query.callback) {
            return false
        }
        return url_parts.query.callback;
    };

    /**
     * Handle the request.
     *
     * #1. Find the mock matching the request information.
     * #2. Get the selected scenario
     * #3. Send the response back
     *
     * @param request The http request.
     * @param response The http response.
     * @param next The next middleware.
     * @param config The configuration containing all the mocking information.
     */
    function handleRequest(request, response, next, config) {
        // #1
        var matchingMock = getMatchingMock(config.mocks, request);

        if (matchingMock) {
            var ngApimockId = request.headers.ngapimockid,
                selection, variables, payload, hold;

            request.on('data', function (rawData) {
                payload = rawData.toString();
            });

            if (ngApimockId !== undefined) {
                if (config.sessions[ngApimockId] === undefined) {
                    // if there is no session selections present, add the defaults
                    config.sessions[ngApimockId] = {
                        selections: JSON.parse(JSON.stringify(config.defaults)),
                        variables: {}
                    };
                }
                selection = config.sessions[ngApimockId].selections[matchingMock.identifier];
                variables = config.sessions[ngApimockId].variables;

                // determine if we need to hold the response
                if (config.sessions[ngApimockId].hold && config.sessions[ngApimockId].hold[matchingMock.identifier]) {
                    hold = config.sessions[ngApimockId].hold[matchingMock.identifier].hold;
                }
            } else {
                selection = config.selections[matchingMock.identifier];
                variables = config.variables;
            }

            // #2
            var mockResponse = matchingMock.responses[selection];
            if (mockResponse) {
                if (!!matchingMock.echo) {
                    console.log(matchingMock.method + ' request made on \'' + matchingMock.expression + '\' with payload: ', payload);
                }

                var statusCode = mockResponse.status || 200,
                    reasonPhrase, chunk;

                if (mockResponse.file) { // return binary response
                    reasonPhrase = mockResponse.headers || DEFAULT_BINARY_HEADERS;
                    chunk = fs.readFileSync(mockResponse.file);
                } else { // return json response
                    reasonPhrase = mockResponse.headers || DEFAULT_HEADERS;
                    chunk = JSON.stringify(mockResponse.data ? updateData(mockResponse.data, variables) : (matchingMock.isArray ? [] : {}));
                }

                if (hold) {
                    // store the response object and all needed values in the session, do not finish the call here
                    config.sessions[ngApimockId].hold[matchingMock.identifier].statusCode = statusCode;
                    config.sessions[ngApimockId].hold[matchingMock.identifier].reasonPhrase = reasonPhrase;
                    config.sessions[ngApimockId].hold[matchingMock.identifier].chunk = chunk;
                    config.sessions[ngApimockId].hold[matchingMock.identifier].response = response;

                } else {
                    var jsonCallbackName = getJsonCallbackName(request);
                    if(jsonCallbackName !== false) {
                        chunk = jsonCallbackName + '(' + chunk + ')';
                    }

                    response.writeHead(statusCode, reasonPhrase);
                    response.end(chunk);
                }

                if (config.record) {
                    storeRecording(payload, chunk, request, statusCode, matchingMock);
                }
            } else {
                if (config.record && !request.headers.record) {
                    var headers = request.headers;
                    headers.record = 'off';
                    var options = {
                        host: headers.host.split(':')[0],
                        port: headers.host.split(':')[1],
                        path: request.url,
                        method: request.method,
                        headers: headers
                    };

                    var req = http.request(options, function (res) {
                        res.setEncoding('utf8');
                        res.on('data', function (chunk) {
                            storeRecording(payload, chunk, request, res.statusCode, matchingMock);
                            response.end(chunk);
                        });
                    });
                    req.on('error', function (e) {
                        response.end(e);
                    });
                    req.end();
                } else {
                    next();
                }
            }
        } else {
            next();
        }
    }

    module.exports = {
        handleRequest: handleRequest
    }
})();
