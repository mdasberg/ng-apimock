import GetVariablesHandler from '../getVariablesHandler';
import Registry from '../../../registry';

/** Handler that takes care of getting all the variables for runtime. */
class RuntimeGetVariablesHandler extends GetVariablesHandler {
    /** @inheritDoc */
    getVariables(registry: Registry, ngApimockId?: string): {} {
        return registry.variables;
    }
}

export default RuntimeGetVariablesHandler;
