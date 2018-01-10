import * as http from 'http';

import Mock from '../../domain/mock';

/** Handler. */
interface Handler {
    /**
     * Takes care of the request.
     * @param {"http".IncomingMessage} request The http request.
     * @param {"http".ServerResponse} response The http response.
     * @param {Function} next The next middleware.
     * @param {string} id The apimock id.
     * @param {Mock} mock The apimock mock.
     */
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, id: string, mock?: Mock): void;
}

export default Handler;
