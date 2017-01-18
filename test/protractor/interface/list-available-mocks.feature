Feature: List all the available mocks

  Developers should be able to see all available scenarios.
  This is a required in order to select a scenario, so the
  application can run against those mocked responses.

  Rules:
  - Mocks that have a scenario that is marked as default should be selected by default
  - Mocks that have no scenario that is marked as default should select passThrough by default

  Background:
    Given a mock with name download has marked binary-download as its default scenario
    And a mock with name list has no scenario marked as default
    And a mock with name update has marked successful as its default scenario

  Scenario: Show available mocks
    Given we open the mocking interface
    Then the following scenario's should be selected:
      | name     | scenario        |
      | download | binary-download |
      | list     | passThrough     |
      | update   | successful      |