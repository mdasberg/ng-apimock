import * as http from 'http';

/** Handler. */
export interface Handler {
    /**
     * Takes care of the request.
     * @param {"http".IncomingMessage} request The http request.
     * @param {"http".ServerResponse} response The http response.
     * @param {Function} next The next middleware.
     * @param {object} params The parameters.
     */
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params?: any): void;
}


/** Handler. */
export interface ApplicableHandler extends Handler {
    /**
     * Indicates if the given request is applicable.
     * @param {"http".IncomingMessage} request The request.
     * @param body The body.
     * @return {boolean} indicator The indicator.
     */
    isApplicable(request: http.IncomingMessage, body?: any): boolean;
}