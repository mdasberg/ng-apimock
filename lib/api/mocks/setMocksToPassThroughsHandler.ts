import * as http from "http";
import {Handler} from "../../handler";
import {Registry} from "../../registry";
import {httpHeaders} from "../../http";

/** Abstract Handler for setting the mocks to passThroughs. */
export abstract class SetMocksToPassThroughsHandler implements Handler {

    /**
     * Sets the selections to passThroughs.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     */
    abstract setToPassThroughs(registry: Registry, ngApimockId?: string): void;

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
     * Handler that takes care of setting the mocks to passThroughs.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry, ngApimockId: string): void {
        this.setToPassThroughs(registry, ngApimockId);
        const selections: {} = this.getSelections(registry, ngApimockId);

        response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify({
                mocks: registry.mocks,
                selections: selections
            }
        ));
    }
}