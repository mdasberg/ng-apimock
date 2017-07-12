var connect = require('connect'),
    serveStatic = require('serve-static'),
    path = require('path'),
    ngApimockUtil = require(path.join(process.cwd(), 'lib/utils')),
    ngApimock = require(path.join(process.cwd(), 'tasks/index.js'))();

let configuration = {src: 'test/mocks', outputDir: '.tmp/some-other-dir'};
ngApimock.run(configuration);
ngApimock.watch(configuration.src);
var app = connect();

app.use(ngApimockUtil.ngApimockRequest);
app.use('/node_modules', serveStatic(path.join(process.cwd(), 'node_modules')));
app.use('/mocking', serveStatic('.tmp/some-other-dir')),
app.use('/', serveStatic(__dirname))
app.use('/online/rest/some/api', function(request, response, next){
    response.writeHead(200, {'Content-Type': 'application/json' });
    if(request.method === 'GET') {
        response.end("[{\"a\":\"b\"}]");
    } else if(request.method === 'POST') {
        response.end("{\"c\": \"d\"}");
    } else {
        next();
    }
});


app.listen(9900);
console.log('server running on port 9900');
