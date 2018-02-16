import container from './core/ioc-container';
import MocksProcessor from './core/processor/processor';
import Middleware from './core/middleware/middleware';

module.exports = {
    processor: container.get<MocksProcessor>('MocksProcessor'),
    middleware: container.get<Middleware>('Middleware')
};