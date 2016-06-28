(function () {
    'use strict';

    var MEDIA_TYPE_APPLICATION_JSON = 'application/json',
            MEDIA_TYPE_APPLICATION_BINARY = 'application/octet-stream',
            DEFAULT_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_JSON},
    DEFAULT_BINARY_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_BINARY},
    fs = require('fs');

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
        var matchingMock = config.mocks.filter(function (mock) {
            var expressionMatches = new RegExp(mock.expression).exec(request.url) !== null;
            var methodMatches = mock.method === request.method;
            return expressionMatches && methodMatches;
        })[0];

        if (matchingMock) {
            var ngApimockId = request.headers.ngapimockid,
                    selection,
                    variables;

            if (ngApimockId !== undefined) {
                var session = config.sessions[ngApimockId];

                if (session === undefined) { // if there is no session selections present, add the defaults
                    config.sessions[ngApimockId] = {
                        selections: JSON.parse(JSON.stringify(config.defaults)),
                        variables: {}
                    };
                }
                selection = config.sessions[ngApimockId].selections[matchingMock.identifier];
                variables = config.sessions[ngApimockId].variables;
            } else {
                selection = config.selections[matchingMock.identifier];
                variables = config.variables;
            }

            // #2
            var mockResponse = matchingMock.responses[selection];
            if (mockResponse) {
                if (!!matchingMock.echo) {
                    request.on('data', function (rawData) {
                        console.log(matchingMock.method + ' request made on \'' + matchingMock.expression + '\' with payload: ', rawData.toString());
                    });
                }

                if (mockResponse.file) {
                    // return binary response
                    var statusCode = mockResponse.status || 200,
                            reasonPhrase = mockResponse.headers || DEFAULT_BINARY_HEADERS;

                    var chunk = fs.readFileSync(mockResponse.file);
                    response.writeHead(statusCode, reasonPhrase);
                    response.end(chunk);
                } else {
                    // return json response
                    var statusCode = mockResponse.status || 200,
                            reasonPhrase = mockResponse.headers || DEFAULT_HEADERS,
                            chunk = JSON.stringify(mockResponse.data ? updateData(mockResponse.data, variables) : (matchingMock.isArray ? [] : {}));

                    response.writeHead(statusCode, reasonPhrase);
                    response.end(chunk);
                }
            } else {
                next();
            }
        } else {
            next();
        }
    }

    module.exports = {
        handleRequest: handleRequest
    }
})();