import * as http from "http";
import {Handler} from "../../handler";
import {Registry} from "../../registry";
import {httpHeaders} from "../../http";
import {Mock} from "../../../tasks/mock";

/** Abstract Handler for Updating mock state. */
export abstract class UpdateMockHandler implements Handler {

    /**
     * Handle the passthrough selection.
     * @param registry The registry.
     * @param identifier The mock identifier.
     * @param ngApimockId The ngApimock id.
     */
    abstract handlePassThroughScenario(registry: Registry, identifier: string, ngApimockId?: string): void;

    /**
     * Handle the scenario selection.
     * @param registry The registry.
     * @param identifier The mock identifier.
     * @param ngApimockId The ngApimock id.
     */
    abstract handleScenarioSelection(registry: Registry, identifier: string, scenario: string, ngApimockId?: string): void;

    /**
     * Handle the echo toggling.
     * @param registry The registry.
     * @param identifier The mock identifier.
     * @param echo Echo indicator.
     * @param ngApimockId The ngApimock id.
     */
    abstract handleEcho(registry: Registry, identifier: string, echo: boolean, ngApimockId?: string): void;

    /**
     * Handle the delay.
     * @param registry The registry.
     * @param identifier The mock identifier.
     * @param delay The delay in millis.
     * @param ngApimockId The ngApimock id.
     */
    abstract handleDelay(registry: Registry, identifier: string, delay: number, ngApimockId?: string): void;

    /**
     * @inheritDoc
     *
     * Handler that takes care of updating the settings for a mock.
     *
     * The following updates are available:
     * - select a scenario
     * - toggle echo state
     * - delay the mock response
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry, ngApimockId: string): void {
        request.on('data', (rawData: string) => {
            const data = JSON.parse(rawData);
            try {
                const match = registry.mocks.filter(_mock => _mock.identifier === data.identifier)[0];
                if (match !== undefined) {
                    if (this.isScenarioSelectionRequest(data)) {
                        if (this.isPassThroughScenario(data.scenario)) {
                            this.handlePassThroughScenario(registry, data.identifier, ngApimockId);
                        } else if (match.responses[data.scenario]) {
                            this.handleScenarioSelection(registry, data.identifier, data.scenario, ngApimockId);
                        } else {
                            throw new Error('No scenario matching name [' + data.scenario + '] found');
                        }
                    } else if (this.isEchoRequest(data)) {
                        this.handleEcho(registry, data.identifier, data.echo, ngApimockId);
                    } else if (this.isDelayResponseRequest(data)) {
                        this.handleDelay(registry, data.identifier, data.delay, ngApimockId);
                    }
                } else {
                    throw new Error('No mock matching identifier [' + data.identifier + '] found');
                }
                response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end();
            } catch (e) {
                response.writeHead(409, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end(JSON.stringify(e, ["message"]));
            }
        });
    }


    /**
     * Indicates if the request to wants to select a scenario.
     * @param data The request data.
     * @returns {boolean} indicator The indicator.
     */
    isScenarioSelectionRequest(data: any): boolean {
        return data.scenario !== undefined;
    }

    /**
     * Indicates if the given request wants to toggle echo.
     * @param data The request data.
     * @returns {boolean} indicator The indicator.
     */
    isEchoRequest(data: any): boolean {
        return data.echo !== undefined;
    }

    /**
     * Indicates if the given request wants to delay a response.
     * @param data The request data.
     * @returns {boolean} indicator The indicator.
     */
    isDelayResponseRequest(data: any): boolean {
        return data.delay !== undefined;
    }

    /**
     * Indicates if the given scenario represents passThrough.
     * @param scenario The scenario.
     * @returns {boolean} indicator The indicator.
     */
    isPassThroughScenario(scenario: string): boolean {
        return scenario === null || scenario === 'passThrough';
    }
}