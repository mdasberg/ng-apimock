(function () {
    'use strict';

    var MEDIA_TYPE_APPLICATION_JSON = 'application/json',
        DEFAULT_HEADERS = {'Content-Type': MEDIA_TYPE_APPLICATION_JSON};

    /**
     * Handles the update mock request.
     *
     * #1. Find the mock matching the request information.
     * #2. Set the selected scenario
     * #3. Send the response back
     *
     * @param request The http request.
     * @param response The http response.
     * @param config The configuration containing all the mock information.
     */
    function handleRequest(request, response, config) {
        var ngApimockId = request.headers.ngapimockid;
        request.on('data', function (rawData) {
            var data = JSON.parse(rawData), code, reason, chunk, oriResponse;

            if(!config.sessions[ngApimockId].hold[data.identifier]) {
                response.writeHead(404, DEFAULT_HEADERS);
                response.end('no mock to release found');
            } else {
                code = config.sessions[ngApimockId].hold[data.identifier].statusCode;
                reason = config.sessions[ngApimockId].hold[data.identifier].reasonPhrase;
                chunk = config.sessions[ngApimockId].hold[data.identifier].chunk;
                oriResponse = config.sessions[ngApimockId].hold[data.identifier].response;
            }

            try {
                if(oriResponse) {
                    oriResponse.writeHead(code, reason);
                    oriResponse.end(chunk);

                    // empty the hold session data
                    config.sessions[ngApimockId].hold[data.identifier] = {};
                    response.writeHead(200, DEFAULT_HEADERS);
                    response.end();
                } else {
                    response.writeHead(404, DEFAULT_HEADERS);
                    response.end('no mock to release found');
                }

            } catch (e) {
                // #3
                console.log(JSON.stringify(e, ["message"]));
                response.writeHead(409, DEFAULT_HEADERS);
                response.end(JSON.stringify(e, ["message"]));
            }
        });
    }

    module.exports = {
        handleRequest: handleRequest
    }
})();