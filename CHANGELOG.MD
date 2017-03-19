<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# Changelog

- [1.2.1](#121)
- [1.2.0](#120)
- [1.1.3](#113)
- [1.1.2](#112)
- [1.1.1](#111)
- [1.1.0](#110)
- [1.0.2](#102)
- [1.0.1](#101)
- [1.0.0](#100)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### 1.2.1

- ADDED JSCS support
- CONVERTED to SimpleUI

### 1.2.0

* REMOVED `Workflow.create` just use `Workflow`
* ADDED npm badge

### 1.1.3

* ADDED uglification of release file

### 1.1.2

* FIXED include lodash and recommend using lodash-modularize to reduce the weight of the library

### 1.1.1

* ADDED a create method to Workflow
* CHANGED documentation to recommend using/referring to the Workflow object as a class

### 1.1.0

* IMPROVED performance of Reflow.ruleAt by removing a closure
* REFACTORED Reflow as a separate object to support multiple reflow rulesets

### 1.0.2

* ADDED `scanIndex`, `scanNextIndex`, `scanPreviousIndex` to search for a suitable index
* ADDED `OUT_OF_BOUNDS` to return instead of undefined for clearer state (along with `isOutOfBounds`)
* REFACTORED Explicit use of lodash, supports rollup.js
* IMPROVED documentation

### 1.0.1

* FIXED documentation

### 1.0.0

* INITIAL @simple-ui\workflow commit
