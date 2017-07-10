import ResetMocksToDefaultsHandler from '../resetMocksToDefaultsHandler';
import helper from '../../helper';
import Registry from '../../../registry';

/** Handler that takes care of resetting the mocks to defaults for protractor. */
class ProtractorResetMocksToDefaultsHandler extends ResetMocksToDefaultsHandler {
    /** @inheritDoc */
    resetToDefaults(registry: Registry, ngApimockId: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        registry.sessions[ngApimockId].selections = JSON.parse(JSON.stringify(registry.defaults));
    }

    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId: string): {} {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].selections;
    }
}

export default ProtractorResetMocksToDefaultsHandler;
