import {Registry} from "../../registry";
import {SetMocksToPassThroughsHandler} from "./setMocksToPassThroughsHandler";

/** Handler that takes care of setting the mocks to passThroughs for protractor. */
export class ProtractorSetMocksToPassThroughsHandler extends SetMocksToPassThroughsHandler {
    /** @inheritDoc */
    setToPassThroughs(registry: Registry, ngApimockId?: string): void {
        registry.sessions[ngApimockId].selections = {};
    }

    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId: string): {} {
        return registry.sessions[ngApimockId].selections;
    }
}