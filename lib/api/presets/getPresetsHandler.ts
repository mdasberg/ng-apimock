import * as http from 'http';
import {httpHeaders} from '../../http';
import Handler from '../../handler';
import Registry from '../../registry';
import Preset from '../../../tasks/preset';

class GetPresetsHandler implements Handler {

    /**
     * Gets the selections.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     * @return presets The presets.
     */
    getPresets(registry: Registry): Preset[] {
        return registry.presets;
    };

    /**
     * @inheritDoc
     *
     * Handler that takes care of getting all the mocks.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry): void {
        const presets = this.getPresets(registry);

        response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(presets));
    }
}

export default GetPresetsHandler;
