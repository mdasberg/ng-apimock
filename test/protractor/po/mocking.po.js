'use strict';

/**
 * Mocking page object.
 * @constructor
 */
var MockingPO = function () {
};

MockingPO.prototype = Object.create({}, {
    partials: {
       get: function() {
           return element(by.name('partials/.*$$GET'));
       }
    },
    apiGET: {
        get: function() {
            return element(by.name('online/rest/some/api/.*/and/.*$$GET'));
        }
    },
    apiPOST: {
        get: function() {
            return element(by.name('online/rest/some/api/.*/and/.*$$POST'));
        }
    },
    echoPOST: {
        get: function() {
            return element(by.model('echo'));
        }
    },
    passThrough: {
        value: function() {
            return element(by.buttonText('All to passThrough')).click();
        }
    },
    defaults: {
        value: function() {
            return element(by.buttonText('Reset to defaults')).click();
        }
    },
    addVariable: {
        value: function(key, value) {
            return element(by.model('ctrl.variable.key')).clear().sendKeys(key).then(function() {
                element(by.model('ctrl.variable.value')).clear().sendKeys(value).then(function() {
                    element(by.buttonText('Add variable')).click();
                });
            });
        }
    },
    updateVariable: {
        value: function(key, value) {
            return element(by.id(key)).element(by.tagName('input')).clear().sendKeys(value).then(function() {
                browser.sleep(501); // debounce of 500
            });
        }
    },
    deleteVariable: {
        value: function(key, value) {
            return element(by.id(key)).element(by.tagName('button')).click();
        }
    }
});

module.exports = MockingPO;