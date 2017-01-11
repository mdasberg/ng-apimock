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
    handleScenarioSelection(registry: Registry, identifier: string, scenario: string, delay: number): void {
        registry.selections[identifier] = scenario;
        // @todo implement delay option for protractor.
    }

    /** @inheritDoc */
    handleEchoToggling(mock: Mock, toggle: boolean): void {
        mock.echo = toggle;
    }
}
