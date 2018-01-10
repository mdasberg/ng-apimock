import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import Handler from '../handler';
import Mock from '../../../domain/mock';
import MocksState from '../../../state/mocks.state';

/**  Handler for a echoing a request. */
@injectable()
class EchoRequestHandler implements Handler {
    @inject('MocksState')
    private mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, id: string, mock: Mock): void {
        const echo: boolean = this.mocksState.getEcho(mock.name, id);

        if (echo) {
            const requestDataChunks: Buffer[] = [];

            request.on('data', (rawData: Buffer) => {
                requestDataChunks.push(rawData);
            });

            const payload: string = Buffer.concat(requestDataChunks).toString();
            console.log(`${mock.method} request made on '${mock.expression}' with payload: '${payload}`);
        }
    }
}

export default EchoRequestHandler;
