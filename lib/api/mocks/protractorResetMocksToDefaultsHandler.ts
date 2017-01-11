import {Registry} from "../../registry";
import {ResetMocksToDefaultsHandler} from "./resetMocksToDefaultsHandler";

/** Handler that takes care of resetting the mocks to defaults for protractor. */
export class ProtractorResetMocksToDefaultsHandler extends ResetMocksToDefaultsHandler {
    /** @inheritDoc */
    resetToDefaults(registry: Registry, ngApimockId: string): void {
        registry.sessions[ngApimockId].selections = JSON.parse(JSON.stringify(registry.defaults));
    }

    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId: string): {} {
        return registry.sessions[ngApimockId].selections;
    }
}
