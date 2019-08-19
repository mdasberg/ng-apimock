const ngApimock = require('./tasks/index')();
const express = require('express');
const app = express();
ngApimock.run({
    "src": "test/mocks",
    "outputDir": ".tmp/ngApimock",
    "done": function () {
    }
});
app.set('port', 3000);

// process the api calls through ng-apimock
app.use(require('./lib/utils').ngApimockRequest);
// serve the mocking interface for local development
app.use('/mocking', express.static('.tmp/ngApimock'));

app.listen(app.get('port'), function () {
    console.info('ngapimock running on port', app.get('port'));
});
