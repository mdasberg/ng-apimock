import {Registry} from "../../../registry";
import {UpdateMockHandler} from "../updateMockHandler";
import {Mock} from "../../../../tasks/mock";
import {helper} from "../../helper";

/** Handler that takes care of updating the mock configuration for protractor. */
export class ProtractorUpdateMockHandler extends UpdateMockHandler{
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
        registry.sessions[ngApimockId].delays[identifier] = delay;
    }

    /** @inheritDoc */
    handleEcho(registry: Registry, identifier: string, echo: boolean, ngApimockId?: string): void {
        registry.sessions[ngApimockId].echos[identifier] = echo;
    }

}
