import {Registry} from "../../../registry";
import {GetVariablesHandler} from "../getVariablesHandler";

/** Handler that takes care of getting all the variables for runtime. */
export class RuntimeGetVariablesHandler extends GetVariablesHandler {
    /** @inheritDoc */
    getVariables(registry: Registry, ngApimockId?: string): {} {
        return registry.variables;
    }
}