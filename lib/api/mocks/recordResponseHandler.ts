import * as http from "http";
import {Handler} from "../../handler";
import {Registry} from "../../registry";
import {httpHeaders} from "../../http";

/** Abstract Handler for Recording the response. */
export abstract class RecordResponseHandler implements Handler {

    /**
     * Record the response.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     */
    abstract record(registry: Registry, ngApimockId?: string): void;


    /**
     * @inheritDoc
     *
     * Handler that takes care of recording responses.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry, ngApimockId: string): void {
        this.record(registry, ngApimockId);
        // registry.record = !registry.record;

        response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify({
                record: registry.record
            }
        ));
    }

}