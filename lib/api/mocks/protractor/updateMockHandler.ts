import helper from '../../helper';
import Registry from '../../../registry';
import UpdateMockHandler from '../updateMockHandler';

/** Handler that takes care of updating the mock configuration for protractor. */
class ProtractorUpdateMockHandler extends UpdateMockHandler {
    /** @inheritDoc */
    handlePassThroughScenario(registry: Registry, identifier: string, ngApimockId: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        delete registry.sessions[ngApimockId].selections[identifier];
    }

    /** @inheritDoc */
    handleScenarioSelection(registry: Registry, identifier: string, scenario: string, ngApimockId: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        registry.sessions[ngApimockId].selections[identifier] = scenario;
    }

    /** @inheritDoc */
    handleDelay(registry: Registry, identifier: string, delay: number, ngApimockId?: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        registry.sessions[ngApimockId].delays[identifier] = delay;
    }

    /** @inheritDoc */
    handleEcho(registry: Registry, identifier: string, echo: boolean, ngApimockId?: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        registry.sessions[ngApimockId].echos[identifier] = echo;
    }
}

export default ProtractorUpdateMockHandler;
