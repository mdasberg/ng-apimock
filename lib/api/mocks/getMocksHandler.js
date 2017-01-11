"use strict";
const http_1 = require("../../http");
/** Abstract Handler for Getting the mocks. */
class GetMocksHandler {
    /**
     * @inheritDoc
     *
     * Handler that takes care of getting all the mocks.
     */
    handleRequest(request, response, next, registry, ngApimockId) {
        const selections = this.getSelections(registry, ngApimockId);
        response.writeHead(200, http_1.httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify({
            mocks: registry.mocks,
            selections: selections,
            recordings: registry.recordings,
            record: registry.record
        }));
    }
}
exports.GetMocksHandler = GetMocksHandler;
//# sourceMappingURL=getMocksHandler.js.map