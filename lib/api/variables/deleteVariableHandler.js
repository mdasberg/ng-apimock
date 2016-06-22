(function () {
    'use strict';

    var MEDIA_TYPE_APPLICATION_JSON = 'application/json',
        DEFAULT_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_JSON},
        VARIABLE_REGEXP = new RegExp('/ngapimock/variables/(.*)');

    /**
     * Handles the delete variable request.
     *
     * @param request The http request.
     * @param response The http response.
     * @param config The configuration containing all the variables.
     */
    function handleRequest(request, response, config) {
        var ngApimockId = request.headers.ngapimockid;
        if (ngApimockId !== undefined) {
            var session = config.sessions[ngApimockId];
            if (session === undefined) { // if there is no session selections present, add the defaults
                config.sessions[ngApimockId] = {
                    selections: JSON.parse(JSON.stringify(config.defaults)),
                    variables: {}
                };
            }
            delete config.sessions[ngApimockId].variables[VARIABLE_REGEXP.exec(request.url)[1]];
        } else {
            delete config.variables[VARIABLE_REGEXP.exec(request.url)[1]];
        }

        response.writeHead(200, DEFAULT_HEADERS);
        response.end();
    }

    module.exports = {
        handleRequest: handleRequest
    }
})();