# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.3.0"></a>
# [2.3.0](https://github.com/npm/annotation-poller/compare/v2.2.0...v2.3.0) (2016-05-19)


### Features

* allow both text and links to be provided in an array of links ([#13](https://github.com/npm/annotation-poller/issues/13)) ([5dd14e3](https://github.com/npm/annotation-poller/commit/5dd14e3))
* Links should open new external windows/tabs ([#11](https://github.com/npm/annotation-poller/issues/11)) ([0e7236c](https://github.com/npm/annotation-poller/commit/0e7236c))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/npm/annotation-poller/compare/v2.1.1...v2.2.0) (2016-05-18)


### Features

* support for multiple images and images with links ([#10](https://github.com/npm/annotation-poller/issues/10)) ([14dc5e0](https://github.com/npm/annotation-poller/commit/14dc5e0))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/npm/annotation-poller/compare/v2.1.0...v2.1.1) (2016-05-18)


### Bug Fixes

* explicitly indicate the files that should be published ([8d2199f](https://github.com/npm/annotation-poller/commit/8d2199f))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/npm/annotation-poller/compare/v2.0.2...v2.1.0) (2016-05-18)


### Bug Fixes

* immediately poll when we load, don't stop polling on failure ([#6](https://github.com/npm/annotation-poller/issues/6)) ([fe82a02](https://github.com/npm/annotation-poller/commit/fe82a02))


### Features

* maintain element ordering in UI ([#7](https://github.com/npm/annotation-poller/issues/7)) ([d440f01](https://github.com/npm/annotation-poller/commit/d440f01))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/npm/annotation-poller/compare/v2.0.1...v2.0.2) (2016-04-21)


### Bug Fixes

* switch to precompiled template ([19a49c2](https://github.com/npm/annotation-poller/commit/19a49c2))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/npm/annotation-poller/compare/v2.0.0...v2.0.1) (2016-04-20)


### Bug Fixes

* we're strong not bold ([f3dfaac](https://github.com/npm/annotation-poller/commit/f3dfaac))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/npm/annotation-poller/compare/v1.2.1...v2.0.0) (2016-04-20)


### Features

* implement new DSL for annotations ([#5](https://github.com/npm/annotation-poller/issues/5)) ([7e4b723](https://github.com/npm/annotation-poller/commit/7e4b723))


### BREAKING CHANGES

* DSL for annotations is now different



<a name="1.2.1"></a>
## [1.2.1](https://github.com/npm/annotation-poller/compare/v1.2.0...v1.2.1) (2016-04-19)


### Bug Fixes

* we were pulling with undefined interval ([d5913a7](https://github.com/npm/annotation-poller/commit/d5913a7))



<a name="1.2.0"></a>
# 1.2.0 (2016-04-19)


### Features

* **add travis:** adding travis build meta-information ([0150898](https://github.com/npm/annotation-poller/commit/0150898))
* **added code:** there is now code in the codebase ([19f2cc5](https://github.com/npm/annotation-poller/commit/19f2cc5))
* **polling:** poller now polls and updates UI ([8d8fbf5](https://github.com/npm/annotation-poller/commit/8d8fbf5))
* payloads now have a fingerprint which can be used to de-dupe ([#3](https://github.com/npm/annotation-poller/issues/3)) ([d8fe372](https://github.com/npm/annotation-poller/commit/d8fe372))
* we should be pulling annotations for a specific package ([#4](https://github.com/npm/annotation-poller/issues/4)) ([a450f0c](https://github.com/npm/annotation-poller/commit/a450f0c))
