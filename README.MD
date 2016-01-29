# Workflow / Adaptive UI

[![Coverage Status](https://coverallflow.io/repos/github/adaptiveui/workflow/badge.svg?branch=master)](https://coverallflow.io/github/adaptiveui/workflow?branch=master)
[![Build Status](https://travis-ci.org/adaptiveui/workflow.svg?branch=master)](https://travis-ci.org/adaptiveui/workflow)
[![Dependency Status](https://david-dm.org/adaptiveui/workflow.svg)](https://david-dm.org/adaptiveui/workflow.svg?style=flat-square)
[![License](https://github.com/adaptiveui/workflow/blob/master/LICENSE)](https://img.shieldflow.io/npm/l/adaptiveui/workflow.svg?style=flat-square)

Workflow builds complex logic-driven, state-based, sequenceflow. Workflow is used to define a flow of work where steps in that flow change dynamically. One sequence of work exists as an exterior index for the end-user (in the interface) and an interior index to control a more complex procesflow.

## Install

Install with npm.

```sh
npm install --save @adaptiveui\workflow
```

Install with bower.

```sh
bower install --save adaptiveui-workflow
```

## Quick Usage

```js
import workflowAUI from "adaptiveui/workflow"

var flow = workflowAUI(['one', 'two', 'three']);

// many is* methods to control interface state
assert(flow.current() === 'one');
assert(flow.isBeforeLast() === true);

// next will return the next value and advance the internal index
assert(flow.index === 0);
assert(flow.next() === 'two');
assert(flow.index === 1);
```

## Usage

### Initialize a Workflow

A Workflow can progress over the following types:

* `integer` which is converted to an array `[0, 1, 2, 3, ..., <integer>]`
* `array`
* `object`

```js
assert((workflowAUI(3)).size() === 3);
assert((workflowAUI([2, 3, 4])).size() === 3);
assert((workflowAUI({ '3':4, '5':4, '1':2 })).size() === 3);
```

#### Moving through a Workflow

A Workflow keeps track of an internal index. By default a workflow maps it's index directly to the underlying source. With an array workflow, if `index = 2`, the `current()` you return the item at index 2.

```js
var flow = workflowAUI([2, 3, 4]);

flow.firstIndex() === 0;       // always 0
flow.lastIndex() === 2;        // last index of an array of 3
flow.index === 0;              // defaults to 0
flow.isFirst() === true;       // index is at 0 which is first
flow.isLast() === false;       // index is at 0 which is not the last
flow.isAfterFirst() === false  // index is at first, so it cannot be after it
flow.isBeforeLast() === true   // index is less than lastIndex()
```

A Workflow bounds the index.

```js
var flow = workflowAUI([2, 3, 4]);

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

#### Objects

The object stored at the index can be retrieved too.

```js
var flow = workflowAUI(['two', 'three', 'four']);

flow.current() === 'two';  // defaults to 'two'
flow.peekFirst() === 'two';    // always the first object
flow.peekLast() === 'four';     // always the last object
```

#### Size

The size of the object being progressed over.

```js
var flow = workflowAUI([2, 3, 4]);

flow.length === 3;
flow.size() === 3;
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
