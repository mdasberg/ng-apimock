import ApplyPresetHandler from '../applyPresetHandler';
import helper from '../../helper';
import Preset from '../../../../tasks/preset';
import ProtractorResetMocksToDefaultsHandler from '../../mocks/protractor/resetMocksToDefaultsHandler';
import ProtractorUpdateMockHandler from '../../mocks/protractor/updateMockHandler';
import Registry from '../../../registry';

/** Handler that takes care of updating the mock configuration for protractor. */
class ProtractorApplyPresetHandler extends ApplyPresetHandler {

    private resetDefaultsHandler: ProtractorResetMocksToDefaultsHandler = new ProtractorResetMocksToDefaultsHandler();
    private updateMockHandler: ProtractorUpdateMockHandler = new ProtractorUpdateMockHandler();

    /** @inheritDoc */
    handlePresetSelection(registry: Registry, preset: Preset, ngApimockId: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        this.resetDefaultsHandler.resetToDefaults(registry, ngApimockId);

        for (const identifier in preset.scenarios) {
            if (preset.scenarios.hasOwnProperty(identifier)) {
                this.updateMockHandler.handleScenarioSelection(registry, identifier, preset.scenarios[identifier], ngApimockId)
            }
        }
    }
}

export default ProtractorApplyPresetHandler;
