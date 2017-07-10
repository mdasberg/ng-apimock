import AddOrUpdateVariableHandler from '../addOrUpdateVariableHandler';
import Registry from '../../../registry';

/** Handler that takes care of adding or updating variables for runtime. */
class RuntimeAddOrUpdateVariableHandler extends AddOrUpdateVariableHandler {
    /** @inheritDoc */
    handleAddOrUpdateVariable(registry: Registry, key: string, value: string): void {
        registry.variables[key] = value;
    }
}

export  default RuntimeAddOrUpdateVariableHandler;
