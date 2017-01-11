import {Registry} from "../../registry";
import {UpdateMockHandler} from "./UpdateMockHandler";
import {Mock} from "../../../tasks/mock";
import {helper} from "../helper";

/** Handler that takes care of updating the mock configuration for protractor. */
export class ProtractorUpdateMockHandler extends UpdateMockHandler{

    /** @inheritDoc */
    handlePassThroughScenario(registry: Registry, identifier: string, ngApimockId: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        console.log('handlePassThroughScenario');
        console.log(JSON.stringify(registry.sessions[ngApimockId].selections[identifier]));
        delete registry.sessions[ngApimockId].selections[identifier];
        console.log(JSON.stringify(registry.sessions[ngApimockId].selections[identifier]));
    }

    /** @inheritDoc */
    handleScenarioSelection(registry: Registry, identifier: string, scenario: string, delay: number, ngApimockId: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        console.log('handleScenarioSelection:' + scenario);
        registry.sessions[ngApimockId].selections[identifier] = scenario;
        // in case this is a delayed call,
        // wait before returning the response
        if (delay !== undefined) {
            registry.sessions[ngApimockId].delays[identifier] = delay;
        }

        console.log(JSON.stringify(registry.sessions[ngApimockId].selections[identifier]));
    }

    /** @inheritDoc */
    handleEchoToggling(mock: Mock, toggle: boolean): void {
        // @todo implement echo option for protractor
    }

}
