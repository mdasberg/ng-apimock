Feature: ngApimock - web interface usage

  Scenario: Open the mocking interface page
    Given I open the test page

  Scenario: When I select a scenario the api call should return the selected scenario response
    When I switch to the mocking page
    And I select scenario some-meaningful-scenario-name for getAllTodos from the dropdown
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"x":"%%replaceMe%%"}]
    And the error from the get response should be undefined

    When I switch back to the mocking page
    And I select scenario anotherSuccess for updateTodo from the dropdown
    And I switch back to the test page
    And I post the data
    Then the data from the post response should be {"some":"thing else"}
    And the error from the post response should be undefined

  Scenario: When I set the selected scenarios to 'passThrough' the api call should go to the actual backend
    When I switch back to the mocking page
    And I select scenario passThrough for getAllTodos from the dropdown
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"a":"b"}]
    And the error from the get response should be undefined

    When I switch back to the mocking page
    And I select scenario passThrough for updateTodo from the dropdown
    And I switch back to the test page
    And I post the data
    Then the data from the post response should be {"c":"d"}
    And the error from the post response should be undefined

  Scenario: When I reset the scenarios to default the api call should return the default selected scenario response
    When I switch back to the mocking page
    And I click reset to defaults
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"a":"b"}]
    And the error from the get response should be undefined

    And I post the data
    Then the data from the post response should be {"some":"thing"}
    And the error from the post response should be undefined

  Scenario: When I reset the scenarios to passThrough the api call should return the actual backend response
    When I switch back to the mocking page
    And I click All to passThrough
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"a":"b"}]
    And the error from the get response should be undefined

    And I post the data
    Then the data from the post response should be {"c":"d"}
    And the error from the post response should be undefined

  Scenario: When I set some global variable the api call response should contain the replaced value
    When I switch back to the mocking page
    And I select scenario some-meaningful-scenario-name for getAllTodos from the dropdown
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"x":"%%replaceMe%%"}]

    When I switch back to the mocking page
    And I create the global variable replaceMe with x
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"x":"x"}]

  Scenario: When I update some global variable the api call response should contain the updated value
    When I switch back to the mocking page
    And I update the global variable replaceMe with z
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"x":"z"}]

  Scenario: When I delete some global variable the api call response should show the non replaced value
    When I switch back to the mocking page
    And I click delete the global variable replaceMe
    And I switch back to the test page
    And I refresh the data
    Then the data from the get response should be [{"x":"%%replaceMe%%"}]

  Scenario: When I enable echoing
    When I switch back to the mocking page
    And I click echo
    Then it should enable echoing

  Scenario: When I disable echoing
    When I switch back to the mocking page
    And I click echo
    Then it should disable echoing
