import 'reflect-metadata';
import {Container} from 'inversify';

import DefaultsHandler from './middleware/handlers/api/defaults.handler';
import DeleteVariableHandler from './middleware/handlers/api/delete-variable.handler';
import EchoRequestHandler from './middleware/handlers/mock/echo.request.handler';
import GetMocksHandler from './middleware/handlers/api/get-mocks.handler';
import GetVariablesHandler from './middleware/handlers/api/get-variables.handler';
import InitHandler from './middleware/handlers/api/init.handler';
import Middleware from './middleware/middleware';
import MockRequestHandler from './middleware/handlers/mock/mock.request.handler';
import MocksState from './state/mocks.state';
import MocksProcessor from './processor/processor';
import PassThroughsHandler from './middleware/handlers/api/pass-throughs.handler';
import RecordResponseHandler from './middleware/handlers/mock/record.response.handler';
import SetVariableHandler from './middleware/handlers/api/set-variable.handler';
import UpdateMocksHandler from './middleware/handlers/api/update-mocks.handler';
import GetRecordingsHandler from './middleware/handlers/api/get-recordings.handler';

// IOC configuration
const container = new Container();
container.bind<string>('BaseUrl').toConstantValue('/ngapimock');
container.bind<MocksState>('MocksState').to(MocksState).inSingletonScope();

container.bind<InitHandler>('InitHandler').to(InitHandler);

container.bind<EchoRequestHandler>('EchoRequestHandler').to(EchoRequestHandler);
container.bind<MockRequestHandler>('MockRequestHandler').to(MockRequestHandler);
container.bind<RecordResponseHandler>('RecordResponseHandler').to(RecordResponseHandler);

container.bind<GetMocksHandler>('GetMocksHandler').to(GetMocksHandler);
container.bind<UpdateMocksHandler>('UpdateMocksHandler').to(UpdateMocksHandler);

container.bind<GetVariablesHandler>('GetVariablesHandler').to(GetVariablesHandler);
container.bind<SetVariableHandler>('SetVariableHandler').to(SetVariableHandler);
container.bind<DeleteVariableHandler>('DeleteVariableHandler').to(DeleteVariableHandler);

container.bind<DefaultsHandler>('DefaultsHandler').to(DefaultsHandler);
container.bind<PassThroughsHandler>('PassThroughsHandler').to(PassThroughsHandler);

container.bind<GetRecordingsHandler>('GetRecordingsHandler').to(GetRecordingsHandler);

container.bind<MocksProcessor>('MocksProcessor').to(MocksProcessor);
container.bind<Middleware>('Middleware').to(Middleware);

export default container;
