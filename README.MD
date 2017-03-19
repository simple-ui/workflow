# Workflow

[![Coverage Status](https://coveralls.io/repos/github/simple-ui/workflow/badge.svg?branch=master)](https://coveralls.io/github/simple-ui/workflow?branch=master)
[![Build Status](https://travis-ci.org/simple-ui/workflow.svg?branch=master)](https://travis-ci.org/simple-ui/workflow)
[![Dependency Status](https://david-dm.org/simple-ui/workflow.svg)](https://david-dm.org/simple-ui/workflow.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/simple-ui_workflow.svg)](https://badge.fury.io/js/simple-ui_workflow)

#### simple-ui_workflow

Workflow is a utility to model logic-driven, state-based workflows. Workflow is used to define a series of steps where step progression can change dynamically. One sequence of work exists as an exterior index for the end-user (in the interface) and an interior index to control a more complex process workflow. A Workflow is an object which encapsulates all logic related to a set of steps and so provides helper methods to query the state of the workflow, to support easy interface control for templates.

## Install

Install with npm.

```sh
npm install --save simple-ui_workflow
```

Install with bower.

```sh
bower install --save simple-ui_workflow
```

### Lodash Dependency

This library requires a small set of lodash. Use [lodash-modularize](https://www.npmjs.com/package/lodash-modularize) to limit how much of lodash is included in your project.

## Quick Usage

```js
import Workflow from "simple-ui_workflow"

var workflow = Workflow(['one', 'two', 'three']);

// many is* methods to control interface state
assert(workflow.current() === 'one');
assert(workflow.isBeforeLast() === true);

// next will return the next value and advance the internal index
assert(workflow.index === 0);
assert(workflow.next() === 'two');
assert(workflow.index === 1);
```

## Usage

### Workflow Scenarios

The following example(s) demonstrate the power of a Workflow and usefulness of managing two indices.

#### Form Validation

Every page/view within a multi-part form should have a validation method.

```js
var workflow = Workflow({
  'step1': {
    // NOTE 'step1' is not valid, so the rule will keep the Workflow at index 0
    isValid: function() { return false; },
    content: {}
  },
  'step2': {
    isValid: function() { return true; },
    content: {}
  }
});

// Rule: if the current view is not valid, assign the workflow to the current workflow
workflow.reflow().rule(function(requestedIndex, requestedItem) {
  if (!this.current().isValid()) {
    return this.index;
  }
});

workflow.next(); // same as workflow.index = 1 (or any other index)
workflow.index === 0; // the valid method at index 0, prevents progression
```

#### User Permission

A Workflow can be used to construct the steps presented to an end-user.

```js
var workflow = Workflow({
  'step1': {
    isPermitted: true,
    content: {}
  },
  'step2': {
    isPermitted: false,
    content: {}
  },
  'step3': {
    isPermitted: true,
    content: {}
  }
});

// Rule: Scan to next/previous permitted item
workflow.reflow().rule(function(requestedIndex) {

  return this.scanIndex(function(scanIndex, scanItem) {
    return scanItem.isPermitted;
  }, (requestedIndex < this.index) ? -1 : 1);

});

workflow.next();
workflow.next();
workflow.index === 2; // it scanned to the next permitted item and not beyond

workflow.previous();
workflow.previous();
workflow.index === 0; // it scanned to the previous permitted item and not beyond
```

#### Isolated Parts

A Workflow may be initialized with multiple sets of reflow objects each defining progression rules. It is useful when providing a Workflow to a component that needs to swap progression rules based on application modes.

```javascript
var workflow = Workflow([1, 2, 3, 4, 5, 6, 7, 8, 9]);

// Apply a reflow with no rules, normal +1 rules for next() apply
workflow.reflow('normal-progression');
workflow.first();
workflow.next();
workflow.next();

// Apply a reflow with skipping odd
workflow.reflow('skip-odd').rule(function(requestIndex) {
  return (requestIndex % 2 === 0)
    ? requestIndex
    : requestIndex + 1;
});

workflow.reflowWith('skip-odd');
workflow.first();
workflow.next();
workflow.next();

// Apply a reflow object directly
workflow.reflowWith(workflow.reflow().rule(function(requestIndex) {
  return requestIndex + 1;
}));
```

### Workflow API

#### Initialize a Workflow

A Workflow can progress over the following types:

* `integer` which is converted to an array `[0, 1, 2, 3, ..., <integer>]`
* `array`
* `object`

```js
assert((Workflow(3)).size() === 3);
assert((Workflow([2, 3, 4])).size() === 3);
assert((Workflow({ '3':4, '5':4, '1':2 })).size() === 3);
```

The Workflow object also doubles as a factory for itself.

```js
var workflow = Workflow();
var workflow = Workflow.create();
```

#### Moving through a Workflow

A Workflow keeps track of an internal index. By default a Workflow maps it's index directly to the underlying source. With an array Workflow, if `index = 2`, the `current()` you return the item at index 2.

```js
var workflow = Workflow([2, 3, 4]);

workflow.firstIndex() === 0;       // always 0
workflow.lastIndex() === 2;        // last index of an array of 3
workflow.index === 0;              // defaults to 0
workflow.isFirst() === true;       // index is at 0 which is first
workflow.isLast() === false;       // index is at 0 which is not the last
workflow.isAfterFirst() === false  // index is at first, so it cannot be after it
workflow.isBeforeLast() === true   // index is less than lastIndex()
```

These methods are most useful in a template, this example uses an imaginary templating language.

```html
<section class="wizard">
  {{ customViewAtIndex(workflow.index) }}
  <button *-show="workflow.isAfterFirst()">Previous</button>
  <button *-show="workflow.isBeforeLast()"
          *-click="workflow.next()">
    Next
  </button>
</section>
```

A Workflow bounds the index.

```js
var workflow = Workflow([2, 3, 4]);

workflow.index = 1;
workflow.index === 1;
// assign an index under the first index, so we set to first
workflow.index = -3;
workflow.index === 0;
// assign an index over the last index, so we set to last
workflow.index = 6;
workflow.index === 2;
// assign a non-numerical index, leave the index at the same location
workflow.index = 'as';
workflow.index === 2;
```

#### Workflows of Objects

The object stored at the index can be retrieved too.

```js
var workflow = Workflow(['two', 'three', 'four']);

workflow.current() === 'two';  // defaults to 'two'
workflow.peekFirst() === 'two';    // always the first object
workflow.peekLast() === 'four';     // always the last object
```

#### Workflow Size

The size of the object being progressed over.

```js
var workflow = Workflow([2, 3, 4]);

workflow.length === 3;
workflow.size() === 3;
```

## License

MIT © [mwjaworski](http://simple-ui.io)

This software is released under the MIT license:

Copyright (c) 2017 mwjaworski mjaworski@acm.org

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.))
