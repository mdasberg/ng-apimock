"use strict";
const http_1 = require("../../http");
/** Abstract Handler for getting all the variables. */
class GetVariablesHandler {
    /**
     * @inheritDoc
     *
     * Handler that takes care of adding and updating variables.
     */
    handleRequest(request, response, next, registry, ngApimockId) {
        const variables = this.getVariables(registry, ngApimockId);
        response.writeHead(200, http_1.httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(variables));
    }
}
exports.GetVariablesHandler = GetVariablesHandler;
//# sourceMappingURL=getVariablesHandler.js.map