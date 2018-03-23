import ApplyPresetHandler from '../applyPresetHandler';
import Preset from '../../../../tasks/preset';
import Registry from '../../../registry';
import RuntimeUpdateMockHandler from '../../mocks/runtime/updateMockHandler';
import RuntimeResetMocksToDefaultsHandler from '../../mocks/runtime/resetMocksToDefaultsHandler';

/** Handler that takes care of updating the mock configuration for protractor. */
class RuntimeApplyPresetHandler extends ApplyPresetHandler {

    private resetDefaultsHandler = new RuntimeResetMocksToDefaultsHandler();
    private updateMockHandler = new RuntimeUpdateMockHandler();

    /** @inheritDoc */
    handlePresetSelection(registry: Registry, preset: Preset, ngApimockId: string): void {
        this.resetDefaultsHandler.resetToDefaults(registry);


        for (const identifier in preset.scenarios) {
            if (preset.scenarios.hasOwnProperty(identifier)) {
                this.updateMockHandler.handleScenarioSelection(registry, identifier, preset.scenarios[identifier])
            }
        }
    }
}

export default RuntimeApplyPresetHandler;
