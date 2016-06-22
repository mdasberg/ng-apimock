(function () {
    'use strict';
    
    var MEDIA_TYPE_APPLICATION_JSON = 'application/json',
        DEFAULT_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_JSON};

    /**
     * Handles the get variables request.
     *
     * @param request The http request.
     * @param response The http response.
     * @param config The configuration containing all the variables.
     */
    function handleRequest(request, response, config) {
        var ngApimockId = request.headers.ngapimockid,
            variables;

        if (ngApimockId !== undefined) {
            var session = config.sessions[ngApimockId];
            if (session === undefined) { // if there is no session selections present, add the defaults
                config.sessions[ngApimockId] = {
                    selections: JSON.parse(JSON.stringify(config.defaults)),
                    variables: {}
                };
            }
            variables = config.sessions[ngApimockId].variables;
        } else {
            variables = config.variables;
        }

        response.writeHead(200, DEFAULT_HEADERS);
        response.end(JSON.stringify(variables));
    }

    module.exports = {
        handleRequest: handleRequest
    }
})();