const connect = require('connect');
const serveStatic = require('serve-static');
const path = require("path");
const app = connect();
const apimock = require(path.join(process.cwd(), 'dist','src','index'));

apimock.processor.process(path.join(process.cwd(), 'test', 'mocks'));

app.use((request, response, next) => apimock.middleware.middleware(request, response, next));
app.use('/', serveStatic(path.join(process.cwd(), 'node_modules/ng-apimock-angularjs-test-app/dist')));
app.use('/items', function (request, response, next) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    if (request.method === 'GET') {
        response.end("[{\"pass\":\"through\"}]");
    } else if (request.method === 'POST') {
        response.end("{\"pass\": \"through\"}");
    } else {
        next();
    }
});
app.listen(9900);
console.log('ng-apimock-angular-test-app is running on port 9900');
