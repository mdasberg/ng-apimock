import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as http from 'http';

import Handler from '../handler';
import MocksState from '../../../state/mocks.state';
import Mock from '../../../domain/mock';

/**  Handler for a variables. */
@injectable()
class VariableHandler implements Handler {

    @inject('MocksState')
    mocksState: MocksState;

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, id: string, mock: Mock): void {
    }
}

export default VariableHandler;
