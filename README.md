# ng-apimock [![Build Status](https://travis-ci.org/mdasberg/ng-apimock.svg?branch=master)](https://travis-ci.org/mdasberg/ng-apimock) [![npm version](https://img.shields.io/node/v/ng-apimock.svg)](https://github.com/mdasberg/ng-apimock) [![dependency Status](https://img.shields.io/david/mdasberg/ng-apimock.svg)](https://david-dm.org/mdasberg/ng-apimock) [![devDependency Status](https://img.shields.io/david/dev/mdasberg/ng-apimock.svg)](https://david-dm.org/mdasberg/gng-apimock#info=devDependencies) [![npm downloads](https://img.shields.io/npm/dm/ng-apimock.svg?style=flat-square)](https://www.npmjs.com/package/ng-apimock)

> Node plugin that provides the ability to use scenario based api mocking:
 - for local development 
 - for protractor testing
 
#### Plugins that use ng-apimock
 - [grunt-ng-apimock](https://mdasberg.github.io/grunt-ng-apimock) is a plugin that makes ng-apimock available for [Grunt](http://gruntjs.com/)
 - [gulp-ng-apimock](https://mdasberg.github.io/gulp-ng-apimock) is a plugin that makes ng-apimock available for [Gulp](http://gulpjs.com/)

## Getting Started

```shell
npm install ng-apimock --save-dev

```

Once the plugin has been installed, you can require it with this line of JavaScript:

```js
var ngApimock = require('ng-apimock')();

```

## The "ngApimock" process mocks

### Overview
In order to use the available mocks, you need to call the run function with this line of JavaScript:

```js
ngApimock.run({
  "src": "test/mocks", 
  "outputDir": "path/to/outputDir", 
  "done": function() { 
  // async
  }
});

```

The run function will process the mock data provided in the configuration and make it accessible for connect as middleware.

In order to watch for changes, you need to call the watch function with this line of Javascript:

```js
ngApimock.watch("test/mocks");

```

The watch function will watch for changes in the mock directory and update accordingly.

### Howto write mocks
There are a couple of rules to follow.

1. For each api call create a separate file
2. Each file needs to follow the format below.

```js
{
  "expression": "your expression here (ie a regex without the leading and trailing '/' or a string)",
  "method": "the http method (ie GET, POST, PUT or DELETE)", // supports JSONP as well
  "name": "identifiable name for this service call"  // if non is provided, expression$$method will be used
  "isArray": "indicates if the response data is an array or object",
  "responses": {
    "some-meaningful-scenario-name": {
      "default": true, // if false or not provided this response will not be used as default
      "status": 200, // optional - defaults to 200
      "headers": {}, // optional - defaults to {}
      "data": {}, // optional
      "file": "path/to/file.ext" // optional, when provided don't forget the matching content-type header as it will result in a file download instead of data
      "statusText": "", // optional
      "delay": 2000 // optional - defaults to no delay when provided this delay will only be used for this response
    },
    "some-other-meaningful-scenario-name": {
      "data": {}
    }
  }
}

```

## Howto use global variables
If for instance, you have date sensitive information in you mocks, mock data is not flexible enough.
You can use global variables for this. By surrounding a value in the response.data with %%theVariableName%%,
you can make your data more flexible, like this:

```json
"responses": {
    "some-meaningful-scenario-name": {
        "data": {
            "today": "%%today%%"
        }
    }
}
```

For local development you can use the web interface to add, change or delete variables.
For protractor you can use the following commands
```js
     ngApimock.setGlobalVariable(name, value); // to add or update
     ngApimock.deleteGlobalVariable(name); // to delete 
```

### Howto serve selected mocks
To be able to use the selected mocks you need to do two things:

1. Add the connect middleware
2. Add the mocking interface to your connect configuration

#### Add the connect middleware
When running connect you can do add the following middleware block to your configuration


```js
var app = connect();
app.use(require('ng-apimock/lib/utils').ngApimockRequest);
app.use(function middleware2(req, res, next) {
  // middleware 2
  next();
});
```

#### Add the mocking interface to your connect configuration
When running grunt-contrib-connect you can do add the following staticServe block to your configuration

```js
var app = connect();
app.use('/mocking', require('serve-static')('path/to/the/generated/mocking/index.html'));
app.use(function middleware2(req, res, next) {
  // middleware 2
  next();
});
```

### Howto use for local development

As you have configured both the [connect middleware](#add-the-connect-middleware) and the [mocking interface](#add-the-mocking-interface-to-your-connect-configuration), everything 
  should work out of the box. By default all the responses configured as default, will be returned if the expression matches.
  
  If you would like to change the selected scenario, you can go to http://localhost:9000/mocking and use the interface to change the selected scenario or variables

The interface looks like this:

![alt tag](https://raw.githubusercontent.com/mdasberg/ng-apimock/master/img/web-interface-ng-apimock.png)



### Howto use for your protractor tests.
As you are building an [AngularJS](https://angularjs.org/) application you will probably use [Protractor](https://angular.github.io/protractor/#/) for testing your UI.

In order to use ngApimock in your protractor tests, require it in your protractor configuration like this:
```js
exports.config = {
    onPrepare: function () {
        global.ngApimock = require('.tmp/mocking/protractor.mock.js');
    }
};
```
and from that point on you can use it in your tests 
```js
describe('Some test', function () {
    it('should do something', function() {
        ngApimock.selectScenario('name of some api', 'another'); // at runtime you can change a scenario
    });
 });
   
```

By default all the scenario's marked as default will be returned if the expression matches. So you only need to add ngApimock.selectScenario in case your test needs
another scenario response to be returned.

NgApimock also works when running multiple tests concurrent, by using the protract session id of the test. 
This ensures that changing a scenario in one test, will not effect another test. 

### Using Angular 2 or higher with Protractor?
If you are using Angular 2 or higher in combination with Protractor you will need to add the following to you configuration.

**Protractor 4**
```js
exports.config = {
    useAllAngular2AppRoots: true
};
```
**Protractor 5 or higher**
```js
exports.config = {
    ngApimockOpts: {
        angularVersion: 2  // {number} provide major version of Angular
    }
};
```

### Available functions
All these functions are protractor promises, so they can be chained.

#### selectScenario(name, scenarioName, options)
Selects the given scenario (when calling this function without a scenario or with 'passThrough' as scenario name, the call will be passed through to the actual backend)

#### delayResponse(name, delay)
Sets the delay time in milliseconds for the mock so the response will be delayed. The delay set here superseeds the delay defined in the response mock.

#### echoRequest(name, indicator)
Sets the indicator which enables / disables the request logging (only post request should be logged)
  
#### setAllScenariosToDefault()
Resets all mocks to the default scenarios

#### setAllScenariosToPassThrough
Resets all mocks to use passthroughs

#### setGlobalVariable(key, value)
Adds or updates the global key/value pair 

#### setGlobalVariable(variables)
Adds or updates the global key/value pairs  ie. {'some':'value', 'another': 'value'}  

#### deleteGlobalVariable(key)
Remove the global variable matching the key

### Howto use recording functionality
You can record API calls in NgApimock. This is usefull if you have a live API, and want to create mocks for them. 
You turn on Recording in the header Record (checkbox), and start calling the API. Requests are recorded for each mock. You can zoom in up to Request Response information.
The response data can be used in mock files, described earlier.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code committing.


