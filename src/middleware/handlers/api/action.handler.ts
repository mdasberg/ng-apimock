import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';
import {HttpHeaders, HttpStatusCode} from '../../http';

import Handler from '../handler';
import MocksState from '../../../state/mocks.state';
import State from '../../../state/state';

/**  Handler for a mocks actions. */
@injectable()
class ActionHandler implements Handler {
    private DEFAULTS = 'defaults';
    private PASS_THROUGHS = 'passThroughs';

    @inject('MocksState')
    private mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: {id: string}): void {
        const requestDataChunks: Buffer[] = [];

        request.on('data', (rawData: Buffer) => {
            requestDataChunks.push(rawData);
        });

        request.on('end', () => {
            const data = JSON.parse(Buffer.concat(requestDataChunks).toString());

            try {
                const action: string = data.action;
                const matchingState: State = this.mocksState.getMatchingState(params.id);

                if (action === this.DEFAULTS) {
                    this.mocksState.setToDefaults(params.id);
                } else if (action === this.PASS_THROUGHS) {
                    this.mocksState.setToPassThroughs(params.id);
                } else {
                    throw new Error(`No action matching ['${action}'] found`);
                }
                const state: any = {
                    state: matchingState,
                    recordings: this.mocksState.recordings,
                    record: this.mocksState.record,
                    mocks: this.mocksState.mocks.map((mock) => ({
                        name: mock.name,
                        isArray: mock.isArray ? [] : {},
                        request: mock.request,
                        responses: Object.keys(mock.responses)
                    }))
                };
                response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end(JSON.stringify(state));
            } catch (e) {
                response.writeHead(HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
                response.end(JSON.stringify(e, ['message']));
            }
        });
    }
}

export default ActionHandler;
