import * as http from 'http';
import {httpHeaders} from '../../http';
import Handler from '../../handler';
import Registry from '../../registry';

/** Abstract Handler for adding and updating variables. */
abstract class AddOrUpdateVariableHandler implements Handler {

    /**
     * Handle add or update variable.
     * @param registry The registry.
     * @param key The key.
     * @param value The value.
     * @param ngApimockId The ngApimock id.
     */
    abstract handleAddOrUpdateVariable(registry: Registry, key: string, value: string, ngApimockId?: string): void;

    /**
     * @inheritDoc
     *
     * Handler that takes care of adding and updating variables.
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
                if (data.key !== undefined && data.value !== undefined) {
                    if (data.key === 'variables' && typeof data.value === 'object') {
                        Object.keys(data.value).forEach((key) => {
                            this.handleAddOrUpdateVariable(registry, key, data.value[key], ngApimockId)
                        });
                    } else {
                        this.handleAddOrUpdateVariable(registry, data.key, data.value, ngApimockId);
                    }
                } else {
                    throw new Error('A variable should have a key and value');
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

export default AddOrUpdateVariableHandler;
