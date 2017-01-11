"use strict";
const http_1 = require("../../http");
/** Abstract Handler for deleting a variable. */
class DeleteVariablesHandler {
    constructor() {
        this.VARIABLE_REGEXP = new RegExp('/ngapimock/variables/(.*)');
    }
    /**
     * @inheritDoc
     *
     * Handler that takes care of adding and updating variables.
     */
    handleRequest(request, response, next, registry, ngApimockId) {
        this.deleteVariable(registry, this.VARIABLE_REGEXP.exec(request.url)[1], ngApimockId);
        response.writeHead(200, http_1.httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end();
    }
}
exports.DeleteVariablesHandler = DeleteVariablesHandler;
//# sourceMappingURL=deleteVariableHandler.js.map