(function () {
    'use strict';

    describe('ngApimock - protractor.mock.js', function () {
        var ngApimock;
        beforeAll(function () {
            ngApimock = require('../../.tmp/some-other-dir/protractor.mock.js');
        });

        describe('when provided without any selected scenarios', function () {
            beforeAll(function () {
                ngApimock.setGlobalVariable('replaceMe', 'y');

                browser.get('/index.html');
            });

            describe('when fetching data with a service', function () {
                it('should not show any data', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"a":"b"}]');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.error')).getText()).toBe('');
                });
            });

            describe('when posting data with a service', function () {
                beforeAll(function () {
                    element(by.buttonText('post me')).click();
                });

                it('should not show any data', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"some":"thing"}');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.postedError')).getText()).toBe('');
                });
            });
        });

        describe('when provided with some selected scenarios', function () {
            beforeAll(function () {
                ngApimock.setGlobalVariable('replaceMe', 'y');
                ngApimock.selectScenario('getAllTodos', 'some-meaningful-scenario-name');
                ngApimock.selectScenario('updateTodo', 'successful');

                browser.get('/index.html');
            });

            describe('when fetching data with a service', function () {
                it('should show data', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"y"}]');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.error')).getText()).toBe('');
                });
            });

            describe('when posting data with a service', function () {
                beforeAll(function () {
                    element(by.buttonText('post me')).click();
                });

                it('should show data', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"some":"thing"}');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.postedError')).getText()).toBe('');
                });
            });
        });

        describe('when changing some selected scenarios', function () {
            beforeAll(function () {
                ngApimock.setGlobalVariable('replaceMe', 'y');
                ngApimock.selectScenario('getAllTodos', 'some-meaningful-scenario-name');
                ngApimock.selectScenario('updateTodo', 'successful');

                browser.get('/index.html');
            });

            describe('when fetching data with a service', function () {
                it('should show data', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"y"}]');
                    ngApimock.selectScenario('getAllTodos', 'another-meaningful-scenario-name');
                    element(by.buttonText('refresh')).click();
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"a":"b"}]');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.error')).getText()).toBe('');
                });
            });

            describe('when posting data with a service', function () {
                beforeAll(function () {
                    element(by.buttonText('post me')).click();
                });

                it('should show data', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"some":"thing"}');
                    ngApimock.selectScenario('updateTodo', 'anotherSuccess');
                    element(by.buttonText('post me')).click();

                    var text = element(by.binding('ctrl.postedData')).getText();
                    expect(text).toBe('{"some":"thing else"}');
                    text.then(function () {
                        ngApimock.selectScenario('updateTodo', 'internal-server-error');
                    });

                    element(by.buttonText('post me')).click();
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.postedError')).getText()).toBe('500');
                });
            });
        });

        describe('when changing some selected scenarios to passThrough', function () {
            beforeEach(function () {
                ngApimock.setGlobalVariable('replaceMe', 'y');
                ngApimock.selectScenario('getAllTodos', 'some-meaningful-scenario-name');
                ngApimock.selectScenario('updateTodo', 'successful');
                browser.get('/index.html');
            });

            describe('when fetching data with a service', function () {
                it('should show data when changing to scenario undefined', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"y"}]');
                    ngApimock.selectScenario('getAllTodos');
                    element(by.buttonText('refresh')).click();
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"a":"b"}]');
                });

                it('should show data when changing to scenario passThrough', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"y"}]');
                    ngApimock.selectScenario('getAllTodos', 'passThrough');
                    element(by.buttonText('refresh')).click();
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"a":"b"}]');
                });
            });

            describe('when posting data with a service', function () {
                beforeEach(function () {
                    element(by.buttonText('post me')).click();
                });

                it('should show data when changing to scenario undefined', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"some":"thing"}');
                    ngApimock.selectScenario('updateTodo', 'anotherSuccess');
                    element(by.buttonText('post me')).click();
                    
                    var text = element(by.binding('ctrl.postedData')).getText();
                    expect(text).toBe('{"some":"thing else"}');
                    text.then(function () {
                        ngApimock.selectScenario('updateTodo');
                    });
                    
                    element(by.buttonText('post me')).click();
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"c":"d"}');
                });


                it('should show data when changing to scenario passThrough', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"some":"thing"}');
                    ngApimock.selectScenario('updateTodo', 'anotherSuccess');
                    element(by.buttonText('post me')).click();

                    var text = element(by.binding('ctrl.postedData')).getText();
                    expect(text).toBe('{"some":"thing else"}');
                    text.then(function () {
                        ngApimock.selectScenario('updateTodo');
                    });

                    element(by.buttonText('post me')).click();
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"c":"d"}');
                });
            });
        });

        describe('when resetting the scenarios to default', function () {
            beforeAll(function () {
                ngApimock.setGlobalVariable('replaceMe', 'y');
                ngApimock.selectScenario('getAllTodos', 'some-meaningful-scenario-name');
                ngApimock.selectScenario('updateTodo', 'successful');

                browser.get('/index.html');
            });

            describe('when fetching data with a service', function () {
                it('should show data', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"y"}]');
                    ngApimock.setAllScenariosToDefault();
                    element(by.buttonText('refresh')).click();
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"a":"b"}]');
                });
            });

            describe('when posting data with a service', function () {
                beforeAll(function () {
                    element(by.buttonText('post me')).click();
                });

                it('should show data', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"some":"thing"}');
                    ngApimock.selectScenario('updateTodo', 'anotherSuccess');
                    element(by.buttonText('post me')).click();

                    var text = element(by.binding('ctrl.postedData')).getText();
                    expect(text).toBe('{"some":"thing else"}');
                    text.then(function () {
                        ngApimock.selectScenario('updateTodo', 'internal-server-error');
                    });

                    element(by.buttonText('post me')).click();
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.postedError')).getText()).toBe('500');
                });
            });
        });

        describe('when setting the scenarios to passThrough', function () {
            beforeAll(function () {
                ngApimock.setGlobalVariable('replaceMe', 'y');
                ngApimock.selectScenario('getAllTodos', 'some-meaningful-scenario-name');
                ngApimock.selectScenario('updateTodo', 'successful');

                browser.get('/index.html');
            });

            describe('when fetching data with a service', function () {
                it('should show data', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"y"}]');
                    ngApimock.setAllScenariosToPassThrough();
                    element(by.buttonText('refresh')).click();
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"a":"b"}]');
                });
            });

            describe('when posting data with a service', function () {
                beforeAll(function () {
                    element(by.buttonText('post me')).click();
                });

                it('should show data', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('{"c":"d"}');
                    ngApimock.selectScenario('updateTodo', 'anotherSuccess');
                    element(by.buttonText('post me')).click();

                    var text = element(by.binding('ctrl.postedData')).getText();
                    expect(text).toBe('{"some":"thing else"}');
                    text.then(function () {
                        ngApimock.selectScenario('updateTodo', 'internal-server-error');
                    });

                    element(by.buttonText('post me')).click();
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.postedError')).getText()).toBe('500');
                });
            });
        });

        describe('when provided with some selected error scenarios', function () {
            beforeAll(function () {
                ngApimock.selectScenario('getAllTodos', 'internal-server-error');
                ngApimock.selectScenario('updateTodo', 'internal-server-error');

                browser.get('/index.html');
            });

            describe('when fetching data with a service', function () {
                it('should not show any data', function () {
                    expect(element(by.binding('ctrl.data')).getText()).toBe('');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.error')).getText()).toBe('500');
                });
            });

            describe('when posting data with a service', function () {
                beforeAll(function () {
                    element(by.buttonText('post me')).click();
                });

                it('should not show any data', function () {
                    expect(element(by.binding('ctrl.postedData')).getText()).toBe('');
                });

                it('should not show any errors', function () {
                    expect(element(by.binding('ctrl.postedError')).getText()).toBe('500');
                });
            });
        });

        describe('when changing some global variables', function () {
            beforeAll(function () {
                ngApimock.selectScenario('getAllTodos', 'some-meaningful-scenario-name');
                ngApimock.selectScenario('updateTodo', 'successful');
                ngApimock.setGlobalVariable('replaceMe', 'y');

                browser.get('/index.html');
            });

            it('should show previously set variable', function () {
                expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"y"}]');
            });

            it('should show the new value', function () {
                ngApimock.setGlobalVariable('replaceMe', 'x').then(function () {
                    element(by.buttonText('refresh')).click();
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"x"}]');
                });
            });

            it('should show the original value', function () {
                ngApimock.deleteGlobalVariable('replaceMe').then(function () {
                    element(by.buttonText('refresh')).click();
                    expect(element(by.binding('ctrl.data')).getText()).toBe('[{"x":"%%replaceMe%%"}]');
                });
            });
        });
    })
})();