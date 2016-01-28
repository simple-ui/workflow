# Workflow / Adaptive UI

[![Coverage Status](https://coveralls.io/repos/github/adaptiveui/workflow/badge.svg?branch=master)](https://coveralls.io/github/adaptiveui/workflow?branch=master)
[![Build Status](https://travis-ci.org/adaptiveui/workflow.svg?branch=master)](https://travis-ci.org/adaptiveui/workflow)
[![Dependency Status](https://david-dm.org/adaptiveui/workflow.svg)](https://david-dm.org/adaptiveui/workflow.svg?style=flat-square)
[![License](https://github.com/adaptiveui/workflow/blob/master/LICENSE)](https://img.shields.io/npm/l/adaptiveui/workflow.svg?style=flat-square)

Workflow defines a workflow of logic-drive events. A workflow manager for interfaces which helps controlling the state of interface elements. In advanced scenarios, a workflow maps an exterior workflow (for the user) and an interior workflow (which drives an internal process); useful for providing a simple step control for users of a complex process.

## Install

```sh
npm i -D adaptiveui\workflow
```

## Example

```js
import workflowAUI from "adaptiveui/workflow"

var workflow = workflowAUI(['one', 'two', 'three']);

// many is* methods to control interface state
assert(workflow.current() === 'one');
assert(workflow.isBeforeLast() === true);

// next will return the next value and advance the internal index
assert(workflow.index === 0);
assert(workflow.next() === 'two');
assert(workflow.index === 1);
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

A workflow keeps track from an internal index. By default a workflow maps it's index directly to the underlying source. With an array workflow, if `index = 2`, the `current()` you return the item at index 2.

```js
var s = workflowAUI([2, 3, 4]);

s.firstIndex() === 0;       // always 0
s.lastIndex() === 2;        // last index of an array of 3
s.index === 0;              // defaults to 0
s.isFirst() === true;       // index is at 0 which is first
s.isLast() === false;       // index is at 0 which is not the last
s.isAfterFirst() === false  // index is at first, so it cannot be after it
s.isBeforeLast() === true   // index is less than lastIndex()
```

A Workflow bounds the index.

```js
var s = workflowAUI([2, 3, 4]);

s.index = 1;
s.index === 1;

s.index = -3;     // under, so we set to first
s.index === 0;

s.index = 6;      // over, so we set to last
s.index === 2;

s.index = 'as';   // not, a number so we do not change the value
s.index === 2;
```

#### Objects

The object stored at the index can be retrieved too.

```js
var s = workflowAUI(['two', 'three', 'four']);

s.current() === 'two';  // defaults to 'two'
s.peekFirst() === 'two';    // always the first object
s.peekLast() === 'four';     // always the last object
```

#### Size

The size of the object being progressed over.

```js
var s = workflowAUI([2, 3, 4]);

s.length === 3;
s.size() === 3;
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
