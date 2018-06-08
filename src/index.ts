import container from './core/ioc-container';
import MocksProcessor from './core/processor/processor';
import Middleware from './core/middleware/middleware';
import * as http from 'http';

class Apimock {
    get processor() {
        return container.get<MocksProcessor>('MocksProcessor');
    }

    middleware(request: http.IncomingMessage, response: http.ServerResponse, next: Function) {
        return container.get<Middleware>('Middleware').middleware(request, response, next);
    }
}

module.exports = new Apimock();