import {NgApimockHandler} from "../ngApimockHandler";
import {Registry} from "../registry";

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

    /** @inheritDoc */
    getEcho(registry: Registry, identifier: string): boolean {
        return registry.echos[identifier];
    }

    /** @inheritDoc */
    getDelay(registry: Registry, identifier: string): number {
        return registry.delays[identifier];
    }

}