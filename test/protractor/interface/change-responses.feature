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
    Given we open the test page
    Then the passThrough response should be returned for mock with name list
    And the status code should be undefined for mock with name list

  Scenario: Post me
    Given we open the test page
    When we post data
    Then the successful response should be returned for mock with name update
    And the status code should be undefined for mock with name update

  Scenario: Download binary
    Given we open the test page
    When we download the pdf
    Then the binary-download response should be downloaded for mock with name download


    ### Scenario's ###

    # Verify after selecting scenario's

  Scenario: Select another scenario and get the list
    Given we open the test page
    When we switch to mocking interface
    And we select groceries for mock with name list
    And we switch to test page
    And we refresh
    Then the groceries response should be returned for mock with name list

  Scenario: Select another scenario and get the list using jsonp
    Given we open the test page
    When we switch to mocking interface
    And we select wishes for mock with name list
    And we switch to test page
    And we refresh using jsonp
    Then the wishes response should be returned for mock with name list
    And the status code should be undefined for mock with name list

  Scenario: Select another scenario and post me
    Given we open the test page
    When we switch to mocking interface
    And we select anotherSuccess for mock with name update
    And we switch to test page
    And we post data
    Then the anotherSuccess response should be returned for mock with name update
    And the status code should be undefined for mock with name update

    # Verify after resetting the scenario's to default

  Scenario: Reset scenario's to default
    Given we open the test page
    When we switch to mocking interface
    And we reset the scenario's to defaults
    And we switch to test page
    And we refresh
    Then the passThrough response should be returned for mock with name list
    And the status code should be undefined for mock with name list
    And we post data
    Then the successful response should be returned for mock with name update
    And the status code should be undefined for mock with name update

   # Verify after resetting the scenario's to passThrough

  Scenario: Reset scenario's to passThroughs
    Given we open the test page
    When we switch to mocking interface
    And we reset the scenario's to passThroughs
    And we switch to test page
    And we refresh
    Then the passThrough response should be returned for mock with name list
    And the status code should be undefined for mock with name list
    And we post data
    Then the passThrough response should be returned for mock with name update
    And the status code should be undefined for mock with name update


    ### Variables ###

    # Verify after adding a variable

  Scenario: Add a global variable
    Given we open the test page
    When we switch to mocking interface

    # Select a scenario that has a value that can be interpolated
    And we select groceries for mock with name list
    And we add variable numberOfApples with value 5
    And we switch to test page
    And we refresh
    Then the groceries response should be returned with interpolated value 5 for key numberOfApples for mock with name list

    # Verify after updating a variable
  Scenario: Update a global variable
    Given we open the test page
    When we switch to mocking interface

    # Select a scenario that has a value that can be interpolated
    And we select groceries for mock with name list
    And we update variable numberOfApples with value 6
    And we switch to test page
    And we refresh
    Then the groceries response should be returned with interpolated value 6 for key numberOfApples for mock with name list

   # Verify after deleting a variable
  Scenario: Delete a global variable
    Given we open the test page
    When we switch to mocking interface

    # Select a scenario that has a value that can be interpolated
    And we select groceries for mock with name list
    And we delete variable numberOfApples
    And we switch to test page
    And we refresh
    Then the groceries response should be returned for mock with name list


    ### Recording ###

  # Verify after recording

  Scenario: Record responses
    Given we open the test page
    When we switch to mocking interface

    And we select passThrough for mock with name list
    And we enable recording
    And we switch to test page
    And we refresh
    And we refresh
    And we refresh
    And we switch to mocking interface
    And we show the recordings for mock with name list
    # only 2 will be recorded per mock
    Then there should only be 2 recordings present for mock with name list
    And we hide the recordings for mock with name list
    Then there should only be 0 recordings present for mock with name list
    And we switch to test page

    ### Echoing ###

    # No way to verify this. check the log manually
  Scenario: Enable echo
    Given we open the test page
    And we switch to mocking interface
    And we enable echo for mock with name list
    Then echoing should be enabled for mock with name list
    And we switch to test page

  Scenario: Disable echo
    Given we open the test page
    And we switch to mocking interface
    And we disable echo for mock with name list
    Then echoing should be disabled for mock with name list
    And we switch to test page


    ### Delaying ###

  Scenario: Delay the response
    Given we open the test page
    And we switch to mocking interface
    And we delay the response for mock with name list for 5000 milliseconds
    When I click the button to get the data
    Then I see a loading warning
    When the mock is released
    Then I don't see the loading warning
    And I see a success message