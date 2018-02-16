@default
Feature: Default responses

  - When an api call matches the mock request, the default response should be returned.

  Background:
    Given the following mock state
      | name      | scenario          |
      | get items | crypto-currencies |
      | post item | ok                |

  Scenario: Get the items
    Given I open the test page
    And I get the items
    Then the crypto-currencies response is returned for get items

  Scenario: Get the items as jsonp
    Given I open the test page
    And I get the items as jsonp
    Then the crypto-currencies response is returned for get items

  Scenario: Post the item
    Given I open the test page
    When I enter Ripple and post the item
    Then the ok response is returned for post item