@update-mock-state
Feature: Update mock state

  Developers must be able to:

  - Update mock state
    - select scenario
    - echo request
    - delay response

  in order to run the application against mocks.

  Background:
    Given the following mock state
      | name      | scenario          |
      | get items | crypto-currencies |
      | post item | ok                |

    # Verify after selecting a scenario

  Scenario: Update the mock state scenario and get the items
    Given I open the test page
    When I select scenario crypto-exchanges for mock get items
    And I get the items
    Then the crypto-exchanges response is returned for get items

    # Verify after delaying the response

  Scenario: Update the mock state delay and get the items
    Given I open the test page
    When I set delay to 2000 for mock get items
    And I get the items
    Then the items are not yet fetched
    When I wait a 2000 milliseconds
    Then the items are fetched