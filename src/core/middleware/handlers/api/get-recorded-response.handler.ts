import 'reflect-metadata';
import {inject, injectable} from 'inversify';

import * as fs from 'fs-extra';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';

import {ApplicableHandler} from '../handler';
import {HttpHeaders, HttpMethods, HttpStatusCode} from '../../http';

/**  Handler for a recording a response. */
@injectable()
class GetRecordedResponseHandler implements ApplicableHandler {
    /**
     * Constructor.
     * @param {string} baseUrl The base url.
     */
    constructor(@inject('BaseUrl') private baseUrl: string) {
    }

    /** {@inheritDoc}.*/
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function): void {
        const fileName = request.url.substring(request.url.lastIndexOf('/') + 1);
        const file = fs.readFileSync(path.join(os.tmpdir(), fileName));
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_BINARY);
        response.end(file);
    }

    /** {@inheritDoc}.*/
    isApplicable(request: http.IncomingMessage): boolean {
        const methodMatches = request.method === HttpMethods.GET;
        const urlMatches = request.url.startsWith(`${this.baseUrl}/recordings/`);
        return urlMatches && methodMatches;
    }

}

export default GetRecordedResponseHandler;
