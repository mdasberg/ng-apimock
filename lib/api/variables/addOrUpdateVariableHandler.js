(function () {
    'use strict';

    var MEDIA_TYPE_APPLICATION_JSON = 'application/json',
        DEFAULT_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_JSON};

    /**
     * Handles the add or update variable request.
     *
     * @param request The http request.
     * @param response The http response.
     * @param config The configuration containing all the variables.
     */
    function handleRequest(request, response, config) {
        request.on('data', function (rawData) {
            var data = JSON.parse(rawData);

            try {
                if (data.key !== undefined && data.value !== undefined) {
                    var ngApimockId = request.headers.ngapimockid;
                    if (ngApimockId !== undefined) {
                        if (config.sessions[ngApimockId] === undefined) {
                            config.sessions[ngApimockId] = {
                                selections: JSON.parse(JSON.stringify(config.defaults)),
                                variables: {}
                            };
                        }
                        config.sessions[ngApimockId].variables[data.key] = data.value;
                    } else {
                        config.variables[data.key] = data.value;
                    }
                } else {
                    throw new Error('A variable should have a key and value');
                }

                response.writeHead(200, DEFAULT_HEADERS);
                response.end();
            } catch (e) {
                response.writeHead(409, DEFAULT_HEADERS);
                response.end(JSON.stringify(e, ["message"]));
            }
        });
    }

    module.exports = {
        handleRequest: handleRequest
    }
})();