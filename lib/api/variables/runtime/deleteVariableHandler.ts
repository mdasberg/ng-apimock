import {Registry} from "../../../registry";
import {DeleteVariablesHandler} from "../deleteVariableHandler";

/** Handler that takes care of deleting a variable for runtime. */
export class RuntimeDeleteVariableHandler extends DeleteVariablesHandler {
    /** @inheritDoc */
    deleteVariable(registry: Registry, variable: string, ngApimockId?: string): void {
        delete registry.variables[variable];
    }
}