Feature: Change responses

  Developers must be able to:

  - Select scenario's
  - Add or update variables
  - Record responses
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
    When I switch to mocking interface
    And I select groceries for mock with name list
    And I switch to test page
    And I refresh
    Then the groceries response should be returned for mock with name list

  Scenario: Select another scenario and get the list using jsonp
    Given I open the test page
    When I switch to mocking interface
    And I select wishes for mock with name list
    And I switch to test page
    And I refresh using jsonp
    Then the wishes response should be returned for mock with name list
    And the status code should be undefined for mock with name list

  Scenario: Select another scenario and post me
    Given I open the test page
    When I switch to mocking interface
    And I select anotherSuccess for mock with name update
    And I switch to test page
    And I post data
    Then the anotherSuccess response should be returned for mock with name update
    And the status code should be undefined for mock with name update

    # Verify after resetting the scenario's to default

  Scenario: Reset scenario's to default
    Given I open the test page
    When I switch to mocking interface
    And I reset the scenario's to defaults
    And I switch to test page
    And I refresh
    Then the passThrough response should be returned for mock with name list
    And the status code should be undefined for mock with name list
    And I post data
    Then the successful response should be returned for mock with name update
    And the status code should be undefined for mock with name update

   # Verify after resetting the scenario's to passThrough

  Scenario: Reset scenario's to passThroughs
    Given I open the test page
    When I switch to mocking interface
    And I reset the scenario's to passThroughs
    And I switch to test page
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
    When I switch to mocking interface

    # Select a scenario that has a value that can be interpolated
    And I select groceries for mock with name list
    And I add variable numberOfApples with value 5
    And I switch to test page
    And I refresh
    Then the groceries response should be returned with interpolated value 5 for key numberOfApples for mock with name list

    # Verify after updating a variable
  Scenario: Update a global variable
    Given I open the test page
    When I switch to mocking interface

    # Select a scenario that has a value that can be interpolated
    And I select groceries for mock with name list
    And I update variable numberOfApples with value 6
    And I switch to test page
    And I refresh
    Then the groceries response should be returned with interpolated value 6 for key numberOfApples for mock with name list

   # Verify after deleting a variable
  Scenario: Delete a global variable
    Given I open the test page
    When I switch to mocking interface

    # Select a scenario that has a value that can be interpolated
    And I select groceries for mock with name list
    And I delete variable numberOfApples
    And I switch to test page
    And I refresh
    Then the groceries response should be returned for mock with name list


    ### Recording ###

  # Verify after recording

  Scenario: Record responses
    Given I open the test page
    When I switch to mocking interface
    And I select passThrough for mock with name list
    And I enable recording
    And I switch to test page
    And I refresh
    And I refresh
    And I refresh
    And I switch to mocking interface
    And I show the recordings for mock with name list

    # only 2 will be recorded per mock
    Then there should only be 2 recordings present for mock with name list
    And I hide the recordings for mock with name list
    Then there should be no recordings present for mock with name list
    And I switch to test page

    ## Echoing ###

    # No way to verify this. check the log manually
  Scenario: Enable echo
    Given I open the test page
    And I switch to mocking interface
    And I enable echo for mock with name update
    Then echoing should be enabled for mock with name update
    And I switch to test page

  Scenario: Disable echo
    Given I open the test page
    And I switch to mocking interface
    And I disable echo for mock with name update
    Then echoing should be disabled for mock with name update
    And I switch to test page


    ### Delaying ###

  Scenario: Delay the response
    Given I open the test page
    And I switch to mocking interface
    And I select groceries for mock with name list
    And I delay the response for mock with name list for 2000 milliseconds
    And I switch to test page
    When I refresh
    Then the loading warning is visible
    When I wait a 2000 milliseconds
    Then the loading message is visible