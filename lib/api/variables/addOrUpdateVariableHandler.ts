import * as http from "http";
import {Handler} from "../../handler";
import {Registry} from "../../registry";
import {httpHeaders} from "../../http";

/** Abstract Handler for adding and updating variables. */
export abstract class AddOrUpdateVariableHandler implements Handler {

    /**
     * Handle add or update variable.
     * @param registry The registry.
     * @param key The key.
     * @param value The value.
     * @param ngApimockId The ngApimock id.
     */
    abstract handleAddOrUpdateVariable(registry: Registry, key: string, value: string, ngApimockId?: string): void;


    /**
     * @inheritDoc
     *
     * Handler that takes care of adding and updating variables.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry, ngApimockId: string): void {
        request.on('data', (rawData: string) => {
            const data = JSON.parse(rawData);

            try {
                if (data.key !== undefined && data.value !== undefined) {
                    this.handleAddOrUpdateVariable(registry, data.key, data.value, ngApimockId);
                } else {
                    throw new Error('A variable should have a key and value');
                }
                response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end();
            } catch (e) {
                response.writeHead(409, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end(JSON.stringify(e, ["message"]));
            }
        });
    }
}