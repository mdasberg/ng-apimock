<a name="1.4.8"></a>
# 1.4.8 (2019-02-05)

## Fix
- Fix vulnerabilities

<a name="1.4.6"></a>
# 1.4.6 (2018-03-23)

## Fix
- Fix broken deliverable

<a name="1.4.5"></a>
# 1.4.5 (2018-03-15)

## Feature
- Add baseUrl at run configuration

<a name="1.4.4"></a>
# 1.4.4 (2017-12-13)

## Bugfix
- Fix broken browser.addMockModule support for hybrid apps

<a name="1.4.3"></a>
# 1.4.3 (2017-12-12)

## Feature
- Add mock module when available (hybrid apps)

## Bugfix
- Fix ngApimockHandler to match expression on decoded url

<a name="1.4.2"></a>
# 1.4.2 (2017-10-25)

## Feature
- Add support for disabled selenium promise manager

<a name="1.4.1"></a>
# 1.4.1 (2017-08-31)

## Bugfix
- Fix timeouts issues for POST or PUT methods whn passThrough is selected (passTrough does not have to wait for the request end)
- Fix interface issues when selecting passthrough or defaults

<a name="1.4.0"></a>
# 1.4.0 (2017-08-21)

## Feature
- Add Watch mockdata change functionality
- Add functionality for adding and updating global variables as an object 
- Add default delay per scenario functionality

## Bugfix   
- Handle a request after it is ended.
- Synchronous (busy waiting loop) delays 

<a name="1.3.0"></a>
# 1.3.0 (2017-07-11)

## Feature
- Add functionality to add a delay by default per response 

<a name="1.2.5"></a>
# 1.2.5 (2017-06-07)

## Bugfix
- Fix dependency problem when uuid is required by another dependency 

<a name="1.2.4"></a>
# 1.2.4 (2017-04-24)

## Changes
- Add protractor 5 support (useAllAngular2AppRoots was removed in ptor 5, you can now use ngApimockOpts.angularVersion)
- Underneat protractor.mock now uses then-request instead of sync-request

<a name="1.2.3"></a>
# 1.2.3 (2017-02-22)

## Bugfix
- Fix addCookie fails with protractor 5.0.0 and above 

<a name="1.2.2"></a>
# 1.2.2 (2017-02-06)

## Bugfix
- Fix angular-resource not found when using angular application that does not have a dependency on angular-resource

<a name="1.2.1"></a>
# 1.2.1 (2017-01-19)

## Bugfix
- Fix reset to default and set to passthrough when no api call was done before

<a name="1.2.0"></a>
# 1.2.0 (2017-01-19)

## Changes
- Core has been rewritten in Typescript

## Feature
- Add delayResponse option which makes it possible to delay a response for the given amount of milliseconds.
- Add echoRequest option which makes it possible to echo a http post request .

## Breaking change
- Removed releaseMock and hold option as they required a page to be reloaded when testing a delayed call (replaced by the delayResponse option).

<a name="1.1.13"></a>
# 1.1.13 (2016-11-26)

## Bugfix
- Fix too restrictive domain and path settings from cookie for Angular 2

<a name="1.1.12"></a>
# 1.1.12 (2016-11-23)

## Feature
- Fix incorrect checking if angular exists within the ng-apimock node_modules
- Fix broken interface

<a name="1.1.10"></a>
# 1.1.10 (2016-11-21)

## Feature
- Add support for AngularJS 2 apps

<a name="1.1.8"></a>
# 1.1.8 (2016-10-10)

## Bugfix
- Fix missing angular problem (when both ngapimock and the project that uses it has the same version)

<a name="1.1.7"></a>
# 1.1.7 (2016-10-10)

## Bugfix
- Fix incorrect version to angular. (The project using ngApimock can have another version.)

<a name="1.1.6"></a>
# 1.1.6 (2016-10-10)

## Changes
- Interface is now a component

<a name="1.1.5"></a>
# 1.1.5 (2016-09-21)

## Feature
- Add JSONP support

<a name="1.1.4"></a>
# 1.1.4 (2016-09-13)

## Feature
- Feature delayed mock response added

<a name="1.1.3"></a>
# 1.1.3 (2016-07-01)

## Bugfix
- Fix preventing mocks added more than once

<a name="1.1.2"></a>
# 1.1.2 (2016-06-29)

## Feature
- Add file response functionality (e.g. a pdf download)
- Add recording functionality in the web interface

<a name="1.1.1"></a>
# 1.1.1 (2016-06-27)

## Bugfix
- Fix passThrough scenario selection

<a name="1.1.0"></a>
# 1.1.0 (2016-06-23)

This is the version after separating ng-apimock to a node plugin. 

## Breaking change
- The connect middleware function needs to be required from ng-apimock instead of grunt-ng-apimock

