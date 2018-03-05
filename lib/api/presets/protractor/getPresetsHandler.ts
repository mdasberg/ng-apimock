import helper from '../../helper';
import Registry from '../../../registry';
import GetPresetsHandler from '../getPresetsHandler';

/** Handler that takes care of getting all the mocks for protractor. */
class ProtractorGetPresetsHandler extends GetPresetsHandler {
    /** @inheritDoc */
    getPresets(registry: Registry, ngApimockId?: string): {} {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].presets;
    }
}

export default ProtractorGetPresetsHandler;
