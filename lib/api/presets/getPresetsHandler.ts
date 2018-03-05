import * as http from 'http';
import {httpHeaders} from '../../http';
import Handler from '../../handler';
import Registry from '../../registry';

/** Abstract Handler for Getting the mocks. */
abstract class GetPresetsHandler implements Handler {

    /**
     * Gets the selections.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     * @return presets The presets.
     */
    abstract getPresets(registry: Registry, ngApimockId?: string): { [key: string]: string };


    /**
     * @inheritDoc
     *
     * Handler that takes care of getting all the mocks.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry,
                  ngApimockId: string): void {
        const presets = this.getPresets(registry, ngApimockId);

        response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(presets));
    }
}

export default GetPresetsHandler;
