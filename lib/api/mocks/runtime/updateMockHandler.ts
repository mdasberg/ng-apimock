import {Registry} from "../../../registry";
import {UpdateMockHandler} from "../updateMockHandler";
import {Mock} from "../../../../tasks/mock";

/** Handler that takes care of updating the mock configuration for runtime. */
export class RuntimeUpdateMockHandler extends UpdateMockHandler {
    /** @inheritDoc */
    handlePassThroughScenario(registry: Registry, identifier: string): void {
        delete registry.selections[identifier];
    }

    /** @inheritDoc */
    handleScenarioSelection(registry: Registry, identifier: string, scenario: string): void {
        registry.selections[identifier] = scenario;
    }

    /** @inheritDoc */
    handleDelay(registry: Registry, identifier: string, delay: number): void {
        registry.delays[identifier] = delay;
    }

    /** @inheritDoc */
    handleEcho(registry: Registry, identifier: string, echo: boolean): void {
        registry.echos[identifier] = echo;
    }
}
