import {Registry} from "../../../registry";
import {AddOrUpdateVariableHandler} from "../addOrUpdateVariableHandler";

/** Handler that takes care of adding or updating variables for runtime. */
export class RuntimeAddOrUpdateVariableHandler extends AddOrUpdateVariableHandler {
    /** @inheritDoc */
    handleAddOrUpdateVariable(registry: Registry, key: string, value: string): void {
        registry.variables[key] = value;
    }

}