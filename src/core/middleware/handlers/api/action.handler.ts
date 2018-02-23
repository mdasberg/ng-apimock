import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';
import {HttpHeaders, HttpStatusCode} from '../../http';

import Handler from '../handler';
import MocksState from '../../../state/mocks.state';

/**  Handler for a mocks actions. */
@injectable()
class ActionHandler implements Handler {
    private DEFAULTS = 'defaults';
    private PASS_THROUGHS = 'passThroughs';

    @inject('MocksState')
    private mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: {
        id: string, payload: { action: string }
    }): void {
        const action: string = params.payload.action;

        if (action === this.DEFAULTS) {
            this.mocksState.setToDefaults(params.id);
        } else if (action === this.PASS_THROUGHS) {
            this.mocksState.setToPassThroughs(params.id);
        }
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end();
    }
}

export default ActionHandler;
