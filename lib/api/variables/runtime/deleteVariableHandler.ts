import DeleteVariablesHandler from '../deleteVariableHandler';
import Registry from '../../../registry';

/** Handler that takes care of deleting a variable for runtime. */
class RuntimeDeleteVariableHandler extends DeleteVariablesHandler {
    /** @inheritDoc */
    deleteVariable(registry: Registry, variable: string, ngApimockId?: string): void {
        delete registry.variables[variable];
    }
}

export default RuntimeDeleteVariableHandler;
