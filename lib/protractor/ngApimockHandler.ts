import {NgApimockHandler} from "../ngApimockHandler";
import {Registry} from "../registry";
import {helper} from "../api/helper";

/** Handler for a request for protractor. */
export class ProtractorNgApimockHandler extends NgApimockHandler {
    /** @inheritDoc */
    getSelection(registry: Registry, identifier: string, ngApimockId: string): string {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].selections[identifier];
    }

    /** @inheritDoc */
    getVariables(registry: Registry, ngApimockId?: string): {} {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].variables;
    }

    /** @inheritDoc */
    getEcho(registry: Registry, identifier: string, ngApimockId: string): boolean {
        return registry.sessions[ngApimockId].echos[identifier];
    }

    /** @inheritDoc */
    getDelay(registry: Registry, identifier: string, ngApimockId: string): number {
        return registry.sessions[ngApimockId].delays[identifier];
    }
}