import * as http from 'http';
import {httpHeaders} from '../../http';
import Handler from '../../handler';
import Registry from '../../registry';

/** Abstract Handler for Resetting mocks to defaults. */
abstract class ResetMocksToDefaultsHandler implements Handler {

    /**
     * Resets the selections to defaults.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     */
    abstract resetToDefaults(registry: Registry, ngApimockId?: string): void;

    /**
     * Gets the selections.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     * @return selections The selections.
     */
    abstract getSelections(registry: Registry, ngApimockId?: string): {};


    /**
     * @inheritDoc
     *
     * Handler that takes care of resetting the mocks to defaults.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry,
                  ngApimockId: string): void {
        this.resetToDefaults(registry, ngApimockId);
        const selections: {} = this.getSelections(registry, ngApimockId);

        response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify({
                mocks: registry.mocks,
                selections: selections
            }
        ));
    }
}

export default ResetMocksToDefaultsHandler;
