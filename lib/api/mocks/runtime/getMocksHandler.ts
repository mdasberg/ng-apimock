import {Registry} from "../../../registry";
import {GetMocksHandler} from "../getMocksHandler";

/** Handler that takes care of getting all the mocks for runtime. */
export class RuntimeGetMocksHandler extends GetMocksHandler {
    /** @inheritDoc */
    getSelections(registry: Registry): {[key: string]: string} {
        return registry.selections;
    }

    /** @inheritDoc */
    getEchos(registry: Registry): {[key: string]: boolean} {
        return registry.echos;
    }

    /** @inheritDoc */
    getDelays(registry: Registry): {[key: string]: number} {
        return registry.delays;
    }
}
