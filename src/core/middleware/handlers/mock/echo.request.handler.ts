import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';
import {Handler} from '../handler';

/**  Handler for a echoing a request. */
@injectable()
class EchoRequestHandler implements Handler {
    /**
     * Constructor.
     * @param {MocksState} mocksState The mocks state.
     */
    constructor(@inject('MocksState') private mocksState: MocksState) {
    }

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function,
           params: { id: string, mock: Mock, body: any }): void {
        const echo: boolean = this.mocksState.getEcho(params.mock.name, params.id);

        if (echo) {
            console.log(`${params.mock.request.method} request made on '${params.mock.request.url}' with body: '${JSON.stringify(params.body)}`);
        }
    }
}

export default EchoRequestHandler;
