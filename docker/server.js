const express = require('express');
const path = require('path');
const ngApimock = require('ng-apimock')();
const app = express();

/**
 * Register all available mocks and generate interface
 */
ngApimock.run({
    "src": "/mocks",
    "outputDir": ".tmp/ngApimock",
    "done": function () {
    }
});

app.set('port', 3000);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// process the api calls through ng-apimock
app.use(require('ng-apimock/lib/utils').ngApimockRequest);
// serve the mocking interface for local development
app.use('/mocking', express.static('.tmp/ngApimock'));

app.listen(app.get('port'), function () {
    console.log('ngapimock running on port', app.get('port'));
});