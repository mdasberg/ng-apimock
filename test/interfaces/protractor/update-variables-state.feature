@update-variables-state
Feature: Update variables state

  Developers must be able to:

  - Update variable state
  - add a variable
  - update a variable
  - delete a variable

  in order to run the application against mocks.

  Background:
    Given the following mock state
      | name      | scenario          |
      | get items | crypto-currencies |
      | post item | ok                |

    # Verify after selecting a scenario

  Scenario: Add a variable and get the items (interpolated)
    Given I open the test page
    When I add variable coinName with value Cool
    And I get the items
    Then the response is interpolated with variable Cool

  Scenario: Update a variable and get the items (interpolated)
    Given I open the test page
    When I add variable coinName with value Cool
    And I update variable coinName with value Super
    And I get the items
    Then the response is interpolated with variable Super

  Scenario: Delete a variable and get the items (interpolated)
    Given I open the test page
    When I add variable coinName with value Cool
    And I delete variable coinName
    And I get the items
    Then the crypto-currencies response is returned for get items