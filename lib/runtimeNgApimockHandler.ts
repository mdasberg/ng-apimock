import {NgApimockHandler} from "./ngApimockHandler";
import {Registry} from "./registry";

/** Handler for a request for runtime. */
export class RuntimeNgApimockHandler extends NgApimockHandler {
    /** @inheritDoc */
    getSelection(registry: Registry, identifier: string, ngApimockId: string): string {
        return registry.selections[identifier];
    }

    /** @inheritDoc */
    getVariables(registry: Registry, ngApimockId?: string): {} {
        return registry.variables;
    }

}