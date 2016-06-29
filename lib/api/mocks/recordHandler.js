(function () {
    'use strict';

    var MEDIA_TYPE_APPLICATION_JSON = 'application/json',
        DEFAULT_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_JSON};

    /**
     * Handles the get mocks request.
     *
     * @param request The http request.
     * @param response The http response.
     * @param config The configuration containing all the mock information.
     */
    function handleRequest(request, response, config) {
        config.record = !config.record;
        response.writeHead(200, DEFAULT_HEADERS);
        response.end(JSON.stringify({
                record: config.record
            }
        ));
    }

    module.exports = {
        handleRequest: handleRequest
    }
})();