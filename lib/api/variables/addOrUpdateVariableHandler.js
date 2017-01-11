"use strict";
const http_1 = require("../../http");
/** Abstract Handler for adding and updating variables. */
class AddOrUpdateVariableHandler {
    /**
     * @inheritDoc
     *
     * Handler that takes care of adding and updating variables.
     */
    handleRequest(request, response, next, registry, ngApimockId) {
        request.on('data', (rawData) => {
            const data = JSON.parse(rawData);
            try {
                if (data.key !== undefined && data.value !== undefined) {
                    this.handleAddOrUpdateVariable(registry, data.key, data.value, ngApimockId);
                }
                else {
                    throw new Error('A variable should have a key and value');
                }
                response.writeHead(200, http_1.httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end();
            }
            catch (e) {
                response.writeHead(409, http_1.httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end(JSON.stringify(e, ["message"]));
            }
        });
    }
}
exports.AddOrUpdateVariableHandler = AddOrUpdateVariableHandler;
//# sourceMappingURL=addOrUpdateVariableHandler.js.map