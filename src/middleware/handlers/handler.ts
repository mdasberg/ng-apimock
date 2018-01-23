import * as http from 'http';

import Mock from '../../domain/mock';

/** Handler. */
interface Handler {
    /**
     * Takes care of the request.
     * @param {"http".IncomingMessage} request The http request.
     * @param {"http".ServerResponse} response The http response.
     * @param {Function} next The next middleware.
     * @param {object} params The parameters.
     */
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params?: any): void;
}

export default Handler;
