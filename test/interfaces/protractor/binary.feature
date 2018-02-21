@binary
Feature: Binary data

  Developers must be able to:

  - download files

  Background:
    Given the following mock state
      | name      | scenario          |
      | get items | crypto-currencies |
      | post item | ok                |

   # Verify after resetting the mock state to default

  Scenario: Reset mock state to defaults
    Given I open the test page
    When I select scenario binary for mock get items
    And I download the binary file
    Then the binary response should be downloaded