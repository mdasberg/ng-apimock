import helper from '../../helper';
import GetVariablesHandler from '../getVariablesHandler';
import Registry from '../../../registry';

/** Handler that takes care of getting all the variables for protractor. */
class ProtractorGetVariablesHandler extends GetVariablesHandler {
    /** @inheritDoc */
    getVariables(registry: Registry, ngApimockId?: string): {} {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].variables;
    }
}

export default ProtractorGetVariablesHandler;
