import helper from '../../helper';
import GetMocksHandler from '../getMocksHandler';
import Registry from '../../../registry';

/** Handler that takes care of getting all the mocks for protractor. */
class ProtractorGetMocksHandler extends GetMocksHandler {
    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId?: string): { [key: string]: string } {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].selections;
    }

    /** @inheritDoc */
    getEchos(registry: Registry, ngApimockId?: string): { [key: string]: boolean } {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].echos;
    }

    /** @inheritDoc */
    getDelays(registry: Registry, ngApimockId?: string): { [key: string]: number } {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].delays;
    }
}

export default ProtractorGetMocksHandler;
