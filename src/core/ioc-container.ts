import 'reflect-metadata';
import {Container} from 'inversify';

import EchoRequestHandler from './middleware/handlers/mock/echo.request.handler';
import MockRequestHandler from './middleware/handlers/mock/mock.request.handler';
import RecordResponseHandler from './middleware/handlers/mock/record.response.handler';
import ScenarioHandler from './middleware/handlers/api/scenario.handler';
import ActionHandler from './middleware/handlers/api/action.handler';
import MocksState from './state/mocks.state';
import MocksProcessor from './processor/processor';
import Middleware from './middleware/middleware';
import VariableHandler from './middleware/handlers/api/variable.handler';

// IOC configuration
const container = new Container();

container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();

container.bind<EchoRequestHandler>('EchoRequestHandler').to(EchoRequestHandler);
container.bind<MockRequestHandler>('MockRequestHandler').to(MockRequestHandler);
container.bind<RecordResponseHandler>('RecordResponseHandler').to(RecordResponseHandler);

container.bind<ScenarioHandler>('ScenarioHandler').to(ScenarioHandler);
container.bind<VariableHandler>('VariableHandler').to(VariableHandler);
container.bind<ActionHandler>('ActionHandler').to(ActionHandler);

container.bind<MocksProcessor>('MocksProcessor').to(MocksProcessor);
container.bind<Middleware>('Middleware').to(Middleware);

export default container;
