@actions
Feature: Actions

  Developers must be able to:

  - reset the mock state to defaults
  - set the mock state to passthroughs

  in order to run the application against mocks.

  Background:
    Given the following mock state
      | name      | scenario          |
      | get items | crypto-currencies |
      | post item | ok                |

   # Verify after resetting the mock state to default

  Scenario: Reset mock state to defaults
    Given I open the test page
    When I select scenario crypto-exchanges for mock get items
    And I set delay to 2000 for mock get items
    And I select scenario nok for mock post item
    And I set delay to 2000 for mock post item
    And I reset the mocks to default
    And I get the items
    Then the crypto-currencies response is returned for get items
    And the ok response is returned for post item

   # Verify after resetting the scenario's to passThrough

  Scenario: Set mocks to passThroughs
    Given I open the test page
    And I set the mocks to passThroughs
    And I get the items
    Then the passThrough response is returned for get items
    When I enter Ripple and post the item
    Then the passThrough response is returned for post item
