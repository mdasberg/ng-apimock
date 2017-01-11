import {Registry} from "../../registry";
import {SetMocksToPassThroughsHandler} from "./setMocksToPassThroughsHandler";

/** Handler that takes care of setting the mocks to passThroughs for runtime. */
export class RuntimeSetMocksToPassThroughsHandler extends SetMocksToPassThroughsHandler {
    /** @inheritDoc */
    setToPassThroughs(registry: Registry, ngApimockId?: string): void {
        registry.selections = {};
    }

    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId: string): {} {
        return registry.selections;
    }
}