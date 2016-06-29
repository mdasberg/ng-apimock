Feature: ngApimock - protractor usage (protractor.mock.js)

  Scenario: Open the test page
    Given I open the test page

  Scenario: When I select a scenario the api call should return the selected scenario response
    When I select scenario some-meaningful-scenario-name for getAllTodos
    And I refresh the data
    Then the data from the get response should be [{"x":"%%replaceMe%%"}]
    And the error from the get response should be undefined

    When I select scenario anotherSuccess for updateTodo
    And I post the data
    Then the data from the post response should be {"some":"thing else"}
    And the error from the post response should be undefined

  Scenario: When I set the selected scenarios to null the api call should return the actual backend response
    When I select scenario null for getAllTodos
    And I refresh the data
    Then the data from the get response should be [{"a":"b"}]
    And the error from the get response should be undefined

    When I select scenario null for updateTodo
    And I post the data
    Then the data from the post response should be {"c":"d"}
    And the error from the post response should be undefined

  Scenario: When I set the selected scenarios to 'passThrough' the api call should go to the actual backend
    When I select scenario passThrough for getAllTodos
    And I refresh the data
    Then the data from the get response should be [{"a":"b"}]
    And the error from the get response should be undefined

    When I select scenario passThrough for updateTodo
    And I post the data
    Then the data from the post response should be {"c":"d"}
    And the error from the post response should be undefined

  Scenario: When I reset the scenarios to default the api call should return the default selected scenario response
    When I set all scenarios to default
    And I refresh the data
    Then the data from the get response should be [{"a":"b"}]
    And the error from the get response should be undefined

    And I post the data
    Then the data from the post response should be {"some":"thing"}
    And the error from the post response should be undefined

  Scenario: When I reset the scenarios to passThrough the api call should return the actual backend response
    When I set all scenarios to passThrough
    And I refresh the data
    Then the data from the get response should be [{"a":"b"}]
    And the error from the get response should be undefined

    And I post the data
    Then the data from the post response should be {"c":"d"}
    And the error from the post response should be undefined

  Scenario: When I set some global variable the api call response should contain the replaced value
    When I select scenario some-meaningful-scenario-name for getAllTodos
    And I refresh the data
    Then the data from the get response should be [{"x":"%%replaceMe%%"}]

    When I set the global variable replaceMe with x
    And I refresh the data
    Then the data from the get response should be [{"x":"x"}]

  Scenario: When I delete some global variable the api call response should show the non replaced value
    When I delete the global variable replaceMe
    And I refresh the data
    Then the data from the get response should be [{"x":"%%replaceMe%%"}]

  Scenario: When I select a scenario that returns a file the api call should return the selected scenario response
    When I click download
    Then a file should be downloaded