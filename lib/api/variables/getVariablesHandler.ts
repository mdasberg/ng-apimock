import * as http from 'http';
import {httpHeaders} from '../../http';
import Handler from '../../handler';
import Registry from '../../registry';

/** Abstract Handler for getting all the variables. */
abstract class GetVariablesHandler implements Handler {

    /**
     * Gets the variables.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     * @return variables The variables.
     */
    abstract getVariables(registry: Registry, ngApimockId?: string): {};


    /**
     * @inheritDoc
     *
     * Handler that takes care of adding and updating variables.
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry,
                  ngApimockId: string): void {
        const variables = this.getVariables(registry, ngApimockId);

        response.writeHead(200, httpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(variables));
    }
}

export default GetVariablesHandler;
