import * as http from "http";
import {Handler} from "../../Handler";
import {Registry} from "../../registry";
import {httpHeaders} from "../../http";

/** Abstract Handler for Getting the mocks. */
export abstract class GetMocksHandler implements Handler {

    /**
     * Gets the selections.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     * @return selections The selections.
     */
    abstract getSelections(registry: Registry, ngApimockId?: string): {};


    /**
     * @inheritDoc
     *
     * Handler that takes care of getting all the mocks.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry, ngApimockId: string): void {
        const selections: {} = this.getSelections(registry, ngApimockId);

        response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify({
                mocks: registry.mocks,
                selections: selections,
                recordings: registry.recordings,
                record: registry.record
            }
        ));
    }

}