import {Registry} from "../../registry";
import {ResetMocksToDefaultsHandler} from "./resetMocksToDefaultsHandler";

/** Handler that takes care of resetting the mocks to defaults for runtime. */
export class RuntimeResetMocksToDefaultsHandler extends ResetMocksToDefaultsHandler {
    /** @inheritDoc */
    resetToDefaults(registry: Registry): void {
        registry.selections = JSON.parse(JSON.stringify(registry.defaults));
    }

    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId?: string): {} {
        return registry.selections;
    }
}
