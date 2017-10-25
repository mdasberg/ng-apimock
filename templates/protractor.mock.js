(() => {
    'use strict';

    const path = require('path');
    const ngapimockid = _require('uuid').v4();
    const request = _require('then-request');
    const baseUrl = _require('url-join')(browser.baseUrl, 'ngapimock');

    let _handleRequest = function (httpMethod, urlSuffix, opts, errorMessage) {
        const deferred = protractor.promise.defer();
        request(httpMethod, baseUrl + urlSuffix, opts).done((res) => {
            if (res.statusCode !== 200) {
                deferred.reject(errorMessage);
            } else {
                deferred.fulfill();
            }
        });
        return deferred.promise;
    };

    const ProtractorMock = function () {
        function NgApimockHeader($http, ngApimockInstance) {
            $http.defaults.headers.common['ngapimockid'] = ngApimockInstance.ngapimockid;
        }

        NgApimockHeader.$inject = ['$http', 'ngApimockInstance'];

        angular.module('ngApimock', []);
        angular.module('ngApimock').constant('ngApimockInstance', arguments[0]);
        angular.module('ngApimock').run(NgApimockHeader)
    };

    /** Make sure that angular uses the ngapimock identifier for the requests. */
    browser.getProcessedConfig().then((config) => {
        // As of protractor 5.0.0 the flag config.useAllAngular2AppRoots has been deprecated, to let protractor tell
        // ngApimock that Angular 2 is used a custom object needs to be provided with the angular version in it
        // See: https://github.com/angular/protractor/blob/master/CHANGELOG.md#features-2
        if (config.useAllAngular2AppRoots || ('ngApimockOpts' in config && config.ngApimockOpts.angularVersion > 1)) {
            // angular 2 does not have addMockModule support @see https://github.com/angular/protractor/issues/3092
            // fallback to cookie
            require('hooker').hook(browser, 'get', {
                post: function (result) {
                    return result.then(function () {
                        // Since protractor 5.0.0 the addCookie is an object, see
                        // https://github.com/angular/protractor/blob/master/CHANGELOG.md#500
                        try {
                            return browser.manage().addCookie({name: "ngapimockid", value: ngapimockid});
                        } catch (error) {
                            // Fallback protractor < 5.0.0
                            return browser.manage().addCookie('ngapimockid', ngapimockid);
                        }
                    });
                }
            });
        } else {
            browser.addMockModule('ngApimock', ProtractorMock, {'ngapimockid': ngapimockid})
        }

        if (config.SELENIUM_PROMISE_MANAGER === false) {
            _handleRequest = function (httpMethod, urlSuffix, opts, errorMessage) {
                return new Promise((resolve, reject) => {
                    request(httpMethod, baseUrl + urlSuffix, opts).done((res) => {
                        return res.statusCode === 200 ? resolve() : reject(errorMessage);
                    });
                });
            }
        }
    });


    /**
     * Selects the given scenario for the mock matching the identifier.
     *
     * @param {Object | String} data The data object containing all the information for an expression or the name of the mock.
     * @param scenario The scenario that is selected to be returned when the api is called.
     * @return {Promise} the promise.
     */
    function selectScenario(data, scenario) {
        return _execute('PUT', '/mocks', {
            identifier: _getIdentifier(data),
            scenario: scenario || null
        }, 'Could not select scenario [' + scenario + ']');
    }

    /**
     * Sets the given delay time in milliseconds for the mock matching the identifier.
     * @param {Object | String} data The data object containing all the information for an expression or the name of the mock.
     * @param {number} delay The delay time in milliseconds.
     * @return {Promise} the promise.
     */
    function delayResponse(data, delay) {
        return _execute('PUT', '/mocks', {
            identifier: _getIdentifier(data),
            delay: delay || 0
        }, 'Could not delay the response');
    }

    /**
     * Sets the given echo indicator for the mock matching the identifier.
     * @param {Object | String} data The data object containing all the information for an expression or the name of the mock.
     * @param {boolean} echo The indicator echo request.
     * @return {Promise} the promise.
     */
    function echoRequest(data, echo) {
        return _execute('PUT', '/mocks', {
            identifier: _getIdentifier(data),
            echo: echo || false
        }, 'Could not echo the request');
    }

    /**
     * Selects the default scenario for each mock.
     * @return {Promise} the promise.
     */
    function setAllScenariosToDefault() {
        return _execute('PUT', '/mocks/defaults', undefined, 'Could not set scenarios to default');
    }

    /**
     * Selects passThrough scenario for each mock.
     * @return {Promise} the promise.
     */
    function setAllScenariosToPassThrough() {
        return _execute('PUT', '/mocks/passthroughs', undefined, 'Could not set scenarios to passthroughs');
    }

    /**
     * Add or Updates the given global key/value pair so it is accessible for when the response will returned.
     * @param key The key.
     * @param value The value.
     * @return {Promise} the promise.
     */
    function setGlobalVariable(key, value) {
        return _execute('PUT', '/variables', {
            key: key,
            value: value
        }, 'Could not add or update variable key [' + key + ' with value [' + value + ']');
    }

    /**
     * Add or Updates the given global key/value pairs so it is accessible for when the response will returned.
     * @param variables The variables.
     * @return {Promise} the promise.
     */
    function setGlobalVariables(variables) {
        return _execute('PUT', '/variables', {
            key: 'variables',
            value: variables
        }, 'Could not add or update variables');
    }


    /**
     * The deleteGlobalVariable function removes the global key/value pair.
     * @param key The key.
     * @return {Promise} the promise.
     */
    function deleteGlobalVariable(key) {
        return _execute('DELETE', '/variables/' + key, undefined, 'Could not delete variable with key [' + key + ']');
    }

    /**
     * Executes the api call with the provided information.
     * @param httpMethod The http method.
     * @param urlSuffix The url suffix.
     * @param options The options object.
     * @param errorMessage The error message.
     * @return {Promise} The promise.
     * @private
     */
    function _execute(httpMethod, urlSuffix, options, errorMessage) {
        const opts = {
            headers: {
                'Content-Type': 'application/json',
                'ngapimockid': ngapimockid
            }
        };

        if (options !== undefined) {
            opts.json = options;
        }

        return _handleRequest(httpMethod, urlSuffix, opts, errorMessage);
    }


    /**
     * Adds the angular mock module that makes it possible to use the mocks.
     * @deprecated
     */
    function addMockModule() {
        console.log('addMockModule is no longer supported as of version 1.0.0, and will be removed in future versions');
    }

    /**
     * Removes the angular mock module that makes it possible to use the mocks.
     * @deprecated
     */
    function removeMockModule() {
        console.log('removeMockModule is no longer supported as of version 1.0.0, and will be removed in future versions');
    }

    /**
     * Resets the scenarios..
     * @deprecated Use setAllScenariosToDefault or setAllScenariosToPassThrough
     */
    function resetScenarios() {
        console.log('resetScenarios is no longer supported as of version 1.0.2, and will be removed in future versions.' +
            ' Use setAllScenariosToDefault or setAllScenariosToPassThrough');
    }

    /**
     * Resets the global variables to {}.
     * @deprecated
     */
    function resetGlobalVariables() {
        console.log('resetGlobalVariables is no longer supported as of version 1.0.0, and will be removed in future versions');
    }

    /**
     * Releases a hold mock.
     * @deprecated Use delayResponse.
     */
    function releaseMock() {
        console.log('releaseMock is no longer supported as of version 1.2.*, and will be removed in future versions.' +
            ' Use delay option instead.');
    }

    /**
     * Gets the identifier from the provided data object.
     * @param data The data object.
     * @return {string} identifier The identifier.
     * @private
     */
    function _getIdentifier(data) {
        let identifier;
        if (typeof data === 'string') { // name of the mock
            identifier = data;
        } else if (data.name) { // the data containing the name of the mock
            identifier = data.name;
        } else {
            identifier = data.expression + '$$' + data.method;
        }
        return identifier;
    }

    /**
     * Require the module by first looking under ng-apimock/node_modules and then in the base path.
     * @param dependency The dependency.
     * @return {*} result The result
     * @private
     */
    function _require(dependency) {
        let result;
        try {
            result = require(path.join('ng-apimock', 'node_modules', dependency));
        } catch (ex) {
            result = require(dependency)
        }
        return result;
    }

    /** This Protractor mock allows you to specify which scenario from your json api files you would like to use for your tests. */
    module.exports = {
        selectScenario: selectScenario,
        delayResponse: delayResponse,
        echoRequest: echoRequest,

        setAllScenariosToDefault: setAllScenariosToDefault,
        setAllScenariosToPassThrough: setAllScenariosToPassThrough,

        setGlobalVariable: setGlobalVariable,
        setGlobalVariables: setGlobalVariables,
        deleteGlobalVariable: deleteGlobalVariable,

        // deprecated
        releaseMock: releaseMock,
        addMockModule: addMockModule,
        removeMockModule: removeMockModule,
        resetScenarios: resetScenarios,
        resetGlobalVariables: resetGlobalVariables
    }
})();
