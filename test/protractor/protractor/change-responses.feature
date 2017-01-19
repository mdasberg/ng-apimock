Feature: Change responses

  Developers must be able to:

  - Select scenario's
  - Add or update variables
  - Delay responses
  - Echo requests

  in order to run the application against mocks.

  Background:
    Given a mock with name download has marked binary-download as its default scenario
    And a mock with name list has no scenario marked as default
    And a mock with name update has marked successful as its default scenario

     # Verify without selecting any scenario

  Scenario: Get the list
    Given I open the test page
    Then the passThrough response should be returned for mock with name list
    And the status code should be undefined for mock with name list

  Scenario: Post me
    Given I open the test page
    When I post data
    Then the successful response should be returned for mock with name update
    And the status code should be undefined for mock with name update

  Scenario: Download binary
    Given I open the test page
    When I download the pdf
    Then the binary-download response should be downloaded for mock with name download


    ### Scenario's ###

    # Verify after selecting scenario's

  Scenario: Select another scenario and get the list
    Given I open the test page
    When I select groceries for mock with name list
    And I refresh
    Then the groceries response should be returned for mock with name list

    # Because jsonp calls remove all headers, we have no way to determine which instance of protractor is running.
    # The only thing you can do is to set a default response.
    # Because we have not set a default response, 404 will be returned
  Scenario: Select another scenario and get the list using jsonp
    Given I open the test page
    When I select wishes for mock with name list
    And I refresh using jsonp
    And the status code should be 404 for mock with name list

  Scenario: Select another scenario and post me
    Given I open the test page
    And I select anotherSuccess for mock with name update
    And I post data
    Then the anotherSuccess response should be returned for mock with name update
    And the status code should be undefined for mock with name update

     # Verify after resetting the scenario's to default

  Scenario: Reset scenario's to default
    Given I open the test page
    And I reset the scenario's to defaults
    And I refresh
    Then the passThrough response should be returned for mock with name list
    And the status code should be undefined for mock with name list
    And I post data
    Then the successful response should be returned for mock with name update
    And the status code should be undefined for mock with name update

   # Verify after resetting the scenario's to passThrough

  Scenario: Reset scenario's to passThroughs
    Given I open the test page
    And I reset the scenario's to passThroughs
    And I refresh
    Then the passThrough response should be returned for mock with name list
    And the status code should be undefined for mock with name list
    And I post data
    Then the passThrough response should be returned for mock with name update
    And the status code should be undefined for mock with name update


    ### Variables ###

    # Verify after adding a variable

  Scenario: Add a global variable
    Given I open the test page

    # Select a scenario that has a value that can be interpolated
    And I select groceries for mock with name list
    And I add variable numberOfApples with value 5
    And I refresh
    Then the groceries response should be returned with interpolated value 5 for key numberOfApples for mock with name list

    # Verify after updating a variable
  Scenario: Update a global variable
    Given I open the test page

    # Select a scenario that has a value that can be interpolated
    And I select groceries for mock with name list
    And I update variable numberOfApples with value 6
    And I refresh
    Then the groceries response should be returned with interpolated value 6 for key numberOfApples for mock with name list

   # Verify after deleting a variable
  Scenario: Delete a global variable
    Given I open the test page

    # Select a scenario that has a value that can be interpolated
    And I select groceries for mock with name list
    And I delete variable numberOfApples
    And I refresh
    Then the groceries response should be returned for mock with name list


    ## Echoing ###

    # No way to verify this. check the log manually
  Scenario: Enable echo
    Given I open the test page
    And I enable echo for mock with name update
    Then echoing should be enabled for mock with name update

  Scenario: Disable echo
    Given I open the test page
    And I disable echo for mock with name update
    Then echoing should be disabled for mock with name update


    ### Delaying ###

  Scenario: Delay the response
    Given I open the test page
    And I select groceries for mock with name list
    And I delay the response for mock with name list for 1000 milliseconds
    When I refresh
    Then the loading warning is visible
    When I wait a 1000 milliseconds
    Then the loading message is visible