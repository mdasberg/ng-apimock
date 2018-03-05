import Registry from '../../../registry';
import GetPresetsHandler from '../getPresetsHandler';

/** Handler that takes care of getting all the mocks for runtime. */
class RuntimeGetPresetsHandler extends GetPresetsHandler {
    /** @inheritDoc */
    getPresets(registry: Registry, ngApimockId?: string): {} {
        return registry.presets;
    }
}

export default RuntimeGetPresetsHandler;
