import SetMocksToPassThroughsHandler from '../setMocksToPassThroughsHandler';
import Registry from '../../../registry';

/** Handler that takes care of setting the mocks to passThroughs for runtime. */
class RuntimeSetMocksToPassThroughsHandler extends SetMocksToPassThroughsHandler {
    /** @inheritDoc */
    setToPassThroughs(registry: Registry, ngApimockId?: string): void {
        registry.selections = {};
    }

    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId: string): {} {
        return registry.selections;
    }
}

export default RuntimeSetMocksToPassThroughsHandler;
