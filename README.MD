# Workflow / Adaptive UI

[![Coverage Status](https://coveralls.io/repos/github/adaptiveui/workflow/badge.svg?branch=master)](https://coveralls.io/github/adaptiveui/workflow?branch=master)
[![Build Status](https://travis-ci.org/adaptiveui/workflow.svg?branch=master)](https://travis-ci.org/adaptiveui/workflow)
[![Dependency Status](https://david-dm.org/adaptiveui/workflow.svg)](https://david-dm.org/adaptiveui/workflow.svg?style=flat-square)

Workflow is a utility to model logic-driven, state-based workflows. Workflow is used to define a series of steps where step progression can change dynamically. One sequence of work exists as an exterior index for the end-user (in the interface) and an interior index to control a more complex process flow. A workflow is an object which encapsulates all logic related to a set of steps and so provides helper methods to query the state of the flow, to support easy interface control for templates.

## Install

Install with npm.

```sh
npm install --save @adaptiveui/workflow
```

Install with bower.

```sh
bower install --save adaptiveui-workflow
```

### Lodash Dependency

This library requires all of lodash. It only imports the methods it needs, supporting use of [rollup.js](http://rollupjs.org/) or [lodash-modularize](https://www.npmjs.com/package/lodash-modularize).

## Quick Usage

```js
import workflow from "adaptiveui/workflow"

var flow = workflow(['one', 'two', 'three']);

// many is* methods to control interface state
assert(flow.current() === 'one');
assert(flow.isBeforeLast() === true);

// next will return the next value and advance the internal index
assert(flow.index === 0);
assert(flow.next() === 'two');
assert(flow.index === 1);
```

## Usage

### Workflow API

#### Initialize a Workflow

A Workflow can progress over the following types:

* `integer` which is converted to an array `[0, 1, 2, 3, ..., <integer>]`
* `array`
* `object`

```js
assert((workflow(3)).size() === 3);
assert((workflow([2, 3, 4])).size() === 3);
assert((workflow({ '3':4, '5':4, '1':2 })).size() === 3);
```

#### Moving through a Workflow

A Workflow keeps track of an internal index. By default a workflow maps it's index directly to the underlying source. With an array workflow, if `index = 2`, the `current()` you return the item at index 2.

```js
var flow = workflow([2, 3, 4]);

flow.firstIndex() === 0;       // always 0
flow.lastIndex() === 2;        // last index of an array of 3
flow.index === 0;              // defaults to 0
flow.isFirst() === true;       // index is at 0 which is first
flow.isLast() === false;       // index is at 0 which is not the last
flow.isAfterFirst() === false  // index is at first, so it cannot be after it
flow.isBeforeLast() === true   // index is less than lastIndex()
```

These methods are most useful in a template, this example uses an imaginary templating language.

```html
<section class="wizard">
  {{ customViewAtIndex(flow.index) }}
  <button *-show="flow.isAfterFirst()">Previous</button>
  <button *-show="flow.isBeforeLast()"
          *-click="flow.next()">
    Next
  </button>
</section>
```

A Workflow bounds the index.

```js
var flow = workflow([2, 3, 4]);

flow.index = 1;
flow.index === 1;
// assign an index under the first index, so we set to first
flow.index = -3;     
flow.index === 0;
// assign an index over the last index, so we set to last
flow.index = 6;      
flow.index === 2;
// assign a non-numerical index, leave the index at the same location
flow.index = 'as';   
flow.index === 2;
```

#### Workflows of Objects

The object stored at the index can be retrieved too.

```js
var flow = workflow(['two', 'three', 'four']);

flow.current() === 'two';  // defaults to 'two'
flow.peekFirst() === 'two';    // always the first object
flow.peekLast() === 'four';     // always the last object
```

#### Workflow Size

The size of the object being progressed over.

```js
var flow = workflow([2, 3, 4]);

flow.length === 3;
flow.size() === 3;
```

### Workflow Scenarios

The following example(s) demonstrate the power of a workflow and usefulness of managing two indices.

#### Form Validation

Every page/view within a multi-part form should have a validation method.

```js
var flow = workflow({
  'step1': {    
    // NOTE 'step1' is not valid, so the rule will keep the workflow at index 0
    isValid: function() { return false; },
    content: {}
  },
  'step2': {    
    isValid: function() { return true; },
    content: {}
  }
});

// Rule: if the current view is not valid, assign the flow to the current flow
flow.reflow().rule(function(requestedIndex, requestedItem) {
  if (!this.current().isValid()) {
    return this.index;
  }
});

flow.next(); // same as flow.index = 1 (or any other index)
flow.index === 0; // the valid method at index 0, prevents progression
```

#### User Permission

A workflow can be used to construct the steps presented to an end-user.

```js
var flow = workflow({
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
flow.reflow().rule(function(requestedIndex) {

  return this.scanIndex(function(scanIndex, scanItem) {
    return scanItem.isPermitted;
  }, (requestedIndex < this.index) ? -1 : 1);

});

flow.next();
flow.next();
flow.index === 2; // it scanned to the next permitted item and not beyond

flow.previous();
flow.previous();
flow.index === 0; // it scanned to the previous permitted item and not beyond
```

#### Isolated Parts

A workflow may be initialized with multiple sets of reflow objects each defining progression rules. It is useful when providing a workflow to a component that needs to swap progression rules based on application modes.

```javascript
var flow = workflow([1, 2, 3, 4, 5, 6, 7, 8, 9]);

// Apply a reflow with no rules, normal +1 rules for next() apply
flow.reflow('normal-progression');
flow.first();
flow.next();
flow.next();

// Apply a reflow with skipping odd
flow.reflow('skip-odd').rule(function(requestIndex) {
  return (requestIndex % 2 === 0)
    ? requestIndex
    : requestIndex + 1;
});

flow.reflowWith('skip-odd');
flow.first();
flow.next();
flow.next();

// Apply a reflow object directly
flow.reflowWith(flow.reflow().rule(function(requestIndex) {
  return requestIndex + 1;
}));
```

## License

MIT © [mwjaworski](http://adaptiveui.io)

This software is released under the MIT license:

Copyright (c) 2016 mwjaworski mjaworski@acm.org

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
