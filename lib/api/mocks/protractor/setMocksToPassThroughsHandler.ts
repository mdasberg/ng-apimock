import SetMocksToPassThroughsHandler from '../setMocksToPassThroughsHandler';
import helper from '../../helper';
import Registry from '../../../registry';

/** Handler that takes care of setting the mocks to passThroughs for protractor. */
class ProtractorSetMocksToPassThroughsHandler extends SetMocksToPassThroughsHandler {
    /** @inheritDoc */
    setToPassThroughs(registry: Registry, ngApimockId?: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        registry.sessions[ngApimockId].selections = {};
    }

    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId: string): {} {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].selections;
    }
}

export default ProtractorSetMocksToPassThroughsHandler;
