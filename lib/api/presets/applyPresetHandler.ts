import * as http from 'http';
import {httpHeaders} from '../../http';
import Registry from '../../registry';
import Handler from '../../handler';
import Preset from '../../../tasks/preset';

/** Abstract Handler for Updating mock state. */
abstract class ApplyPresetHandler implements Handler {

    /**
     * Handle the preset selection.
     * @param registry The registry.
     * @param preset The preset identifier.
     * @param ngApimockId The ngApimock id.
     */
    abstract handlePresetSelection(registry: Registry, preset: Preset, ngApimockId?: string): void;

    /**
     * @inheritDoc
     *
     * Handler that takes care of applying the preset
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry,
                  ngApimockId: string): void {
        const requestDataChunks: Buffer[] = [];

        request.on('data', (rawData: Buffer) => {
            requestDataChunks.push(rawData);
        });

        request.on('end', () => {
            const data = JSON.parse(Buffer.concat(requestDataChunks).toString());
            try {
                const match = registry.presets.find(_preset => _preset.name === data.preset);
                if (match) {
                    this.handlePresetSelection(registry, match, ngApimockId);
                } else {
                    throw new Error('No preset matching identifier [' + data + '] found');
                }
                response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end();
            } catch (e) {
                response.writeHead(409, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end(JSON.stringify(e, ['message']));
            }
        });
    }
}

export default ApplyPresetHandler;
