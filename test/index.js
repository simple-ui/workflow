import test from 'tape'
import _ from 'lodash'
import Workflow from '../lib'

test('Workflow Creation', (test) => {

  test.deepEqual((Workflow(2)).source, [0, 1], 'Number-based ss iterate as arrays');
  test.deepEqual((Workflow([2, 3])).source, [2, 3], 'Array-based ss iterate as arrays');
  test.deepEqual((Workflow({
    'a': 4,
    'b': 5
  })).source, {
    'a': 4,
    'b': 5
  }, 'Object-based ss iterate as objects');

  test.deepEqual((Workflow(2)).ordering, ['0', '1'], 'Number-based ss have array indices');
  test.deepEqual((Workflow([2, 3])).ordering, ['0', '1'], 'Array-based ss have array indices');
  test.deepEqual((Workflow({
    'a': 4,
    'b': 5
  })).ordering, ['a', 'b'], 'Object-based ss have array indices');

  test.deepEqual((Workflow.create(2)).ordering, ['0', '1'], 'Workflow.create is also a workflow');
  test.end();

});

test('Workflow Index', (test) => {

  var workflow = Workflow([4, 2, 6, 7, 8]);

  test.equal(workflow.peekFirstIndex(), 0, 'First index is always zero');
  test.equal(workflow.peekLastIndex(), (workflow.size() - 1), 'Last index is one less than the size of the Workflow');
  test.equal(workflow.index, workflow.peekFirstIndex(), 'Index starts at peekFirstIndex');

  workflow.index = 1;
  test.equal(workflow.index, 1, 'Index moves current cursor');

  workflow.index = workflow.peekFirstIndex() - 1;
  test.equal(workflow.index, workflow.peekFirstIndex(), 'Bounded by lower peekFirstIndex');

  workflow.index = workflow.peekLastIndex() + 1;
  test.equal(workflow.index, workflow.peekLastIndex(), 'Bounded by upper peekLastIndex');

  workflow.index = 'invalid';
  test.equal(_.isNumber(workflow.index), true, 'An index will always be numeric');

  workflow.index = '1';
  test.equal(_.isNumber(workflow.index), true, 'An index can be a string of an integer');
  test.end();

});

test('Workflow Index Querying', (test) => {

  var workflow = Workflow([4, 2, 6, 7, 8]);

  workflow.index = 2;
  test.equal(workflow.current(), 6, 'Current points at the value of index');
  test.equal(workflow.peekPrevious(), 2, 'Previous points at the before value of index');
  test.equal(workflow.peekPreviousIndex(), 1, 'Previous Index points at the after index of index');
  test.equal(workflow.peekNext(), 7, 'Next points at the after value of index');
  test.equal(workflow.peekNextIndex(), 3, 'Next Index points at the after index of index');
  test.equal(workflow.peekFirst(), 4, 'First item is always at 0');
  test.equal(workflow.peekFirstIndex(), 0, 'First index is always 0');
  test.equal(workflow.peekLast(), 8, 'Last item is always at peekLastIndex');
  test.equal(workflow.peekLastIndex(), workflow.size() - 1, 'Last index is always one less than size');

  test.equal(workflow.previous(), 2, 'Move to previous item');
  test.equal(workflow.next(), 6, 'Move next, which is back to current item');
  test.equal(workflow.first(), 4, 'Move to first item');
  test.equal(workflow.last(), 8, 'Move to last item');
  test.end();

});

test('Workflow Index Management', (test) => {

  var workflow = Workflow([4, 2, 6, 7, 8]);

  workflow.first();
  test.equal(workflow.isFirst(), true, 'isFirst reports position');
  test.equal(workflow.isAfterFirst(), false, 'is after first');
  test.equal(workflow.isBeforeFirst(), false, 'is before first (only if an error occurs)');

  workflow.last();
  test.equal(workflow.isLast(), true, 'isFirst reports position');
  test.equal(workflow.isBeforeLast(), false, 'is before last');
  test.equal(workflow.isAfterLast(), false, 'is after last (only if an error occurs)');
  test.end();

});

test('Workflow Length', (test) => {

  var workflow;
  var array = [4, 2, 6, 7, 8];

  workflow = Workflow(array);
  test.equal(workflow.size(), array.length, 'is the size of the watched object');
  test.equal(workflow.length, array.length, 'is the size of the watched object');

  workflow = Workflow(4);
  test.equal(workflow.size(), 4, 'is the size of the watched object');
  test.equal(workflow.length, 4, 'is the size of the watched object');
  test.end();

});

test('Workflow Iterator Rules', (test) => {

  var workflow = Workflow([4, 2, 6, 7, 8]);

  test.equal(workflow.queryItem(1), 2, 'queryItem locates the item for an index');
  test.throws(workflow.queryItem(-1), undefined, 'queryItem fails when an item does not exist');
  test.equal(workflow.isAfterLast(0), false, 'queryisAfterLast is a new index after the last allowable index');
  test.equal(workflow.isBeforeFirst(1), false, 'queryIsBeforeFirst is a new index before the first allowable index');
  test.end();

});

test('Workflow Item', (test) => {

  var workflow = Workflow([4, 2, 6, 7, 8]);

  test.equal(workflow.seekItem(0), 4, 'item retrieves the current value');
  test.equal(workflow.seekItem(-1), workflow.first(), 'item returns first for invalid low indices');
  test.equal(workflow.seekItem(workflow.peekLastIndex() + 1), workflow.last(), 'item returns last for invalid high indices');

  test.equal(workflow.peekItem(0), 4, 'peek item retrieves the current value');
  test.equal(workflow.peekItem(-1), workflow.OUT_OF_BOUNDS, 'peek item returns OUT_OF_BOUNDS for invalid values (too low)');
  test.equal(workflow.peekItem(workflow.peekLastIndex() + 1), workflow.OUT_OF_BOUNDS, 'peek item returns OUT_OF_BOUNDS for invalid values (too high)');
  test.end();

});

test('Workflow Empty', (test) => {

  var workflow = Workflow();

  test.equal(workflow.peekFirstIndex(), workflow.peekLastIndex(), 'the first and last index are the same, there is no data');
  test.equal(workflow.current(), undefined, 'all item selectors will return undefined');
  test.end();

});

test('Workflow Scan', (test) => {

  var workflow = Workflow([false, false, true, false, true]);

  test.equal(workflow.index, workflow.peekFirstIndex(), 'workflow starts at first');

  workflow.index = workflow.scanNextIndex(function(index, item) {
    return item;
  });
  test.equal(workflow.index, 2, 'workflow scans to 2, because a boolean true is at that point');

  workflow.index = workflow.scanNextIndex(function(index, item) {
    return item;
  });
  test.equal(workflow.index, 4, 'workflow scans to 4, because a boolean true is at that point');

  var index = workflow.scanNextIndex(function(index, item) {
    return item;
  });
  test.equal(index, workflow.OUT_OF_BOUNDS, 'scan retruns undefined because there are no valid indices to scan to');

  workflow.index = workflow.scanPreviousIndex(function(index, item) {
    return item;
  });
  test.equal(workflow.index, 2, 'workflow scans to 2, because a boolean true is at that point');

  test.end();

});

test('Workflow#toString', (test) => {

  var workflow = Workflow([1, 2, 3, 4]);

  workflow.index = 0;
  test.equal(workflow.toString(), '[1,2,3,4] | 0 | 1', 'toString shows Workflow, index and current value');

  workflow.index = 1;
  test.equal(workflow.toString(), '[1,2,3,4] | 1 | 2', 'toString shows Workflow, index and current value at any index');
  test.end();

});

test('Workflow Reflow', (test) => {

  var workflow = Workflow([3, 4, 5, 6, 7, 8]);

  workflow.reflow().rule(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 3;
    }
  });

  workflow.index = 1;
  test.equal(workflow.index, 1, 'reflow allows 1');

  workflow.index = 2;
  test.equal(workflow.index, 3, 'reflow from 2 to 3');

  workflow.index = 3;
  test.equal(workflow.index, 3, 'reflow allows 3');

  test.end();

});

test('Workflow Reflow Multiple Rules', (test) => {

  var workflow = Workflow([3, 4, 5, 6, 7, 8]);

  workflow.reflow().rule(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 3;
    }
  }).rule(function(requestedIndex) {
    if (requestedIndex === 3) {
      return 1;
    }
  });

  workflow.index = 1;
  test.equal(workflow.index, 1, 'reflow allows 1');

  workflow.index = 2;
  test.equal(workflow.index, 3, 'reflow from 2 to 3');

  workflow.index = 3;
  test.equal(workflow.index, 1, 'reflow from 3 to 1');

  workflow.index = 4;
  test.equal(workflow.index, 4, 'reflow allows 4');

  test.end();

});


test('Workflow Reflow Overriden Rule', (test) => {

  var workflow = Workflow([3, 4, 5, 6, 7, 8]);

  workflow.reflow().rule(function(requestedIndex, requestedItem) {
    if (requestedIndex === 2) {
      test.equal(requestedItem, 5, 'item at index 2 is 5, and is passed in the reflow');
      return 3;
    }
  }).rule(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 0;
    }
  });

  workflow.index = 1;
  test.equal(workflow.index, 1, 'reflow allows 1');

  workflow.index = 2;
  test.equal(workflow.index, 0, 'reflow from 2 to 0, because the most recent reflow rule overrides all previous rules');

  workflow.index = 3;
  test.equal(workflow.index, 3, 'reflow allows 3');

  workflow.index = 4;
  test.equal(workflow.index, 4, 'reflow allows 4');

  test.end();

});

test('Workflow Reflow At', (test) => {

  var workflow = Workflow([3, 4, 5, 6, 7, 8]);

  workflow.reflow().ruleAt(2, function(requestedIndex, requestedItem) {
    test.equal(requestedItem, 5, 'item at index 2 is 5, and is passed in the reflow');
    return 3;
  }).ruleAt(2, function(requestedIndex) {
    return 0;
  });

  workflow.index = 1;
  test.equal(workflow.index, 1, 'reflow allows 1');

  workflow.index = 2;
  test.equal(workflow.index, 0, 'reflow from 2 to 0, because the most recent reflow rule overrides all previous rules');

  workflow.index = 3;
  test.equal(workflow.index, 3, 'reflow allows 3');

  workflow.index = 4;
  test.equal(workflow.index, 4, 'reflow allows 4');

  test.end();

});

test('Workflow Reflow Sets', (test) => {

  var workflow = Workflow([3, 4, 5, 6, 7, 8]);

  workflow.reflow('set-1').rule(function() {
    console.log('set-1');
    return 0;
  });

  workflow.reflow('set-2').rule(function() {
    console.log('set-2');
    return 1;
  });

  workflow.reflowWith();
  workflow.first();
  test.equal(workflow.index, 0, 'workflow starts at the beginning');
  workflow.next();
  test.equal(workflow.index, 1, 'workflow continues next to 1');
  workflow.next();
  test.equal(workflow.index, 2, 'workflow continues next to 2');

  workflow.reflowWith('set-1');
  workflow.first();
  test.equal(workflow.index, 0, 'set-1: workflow starts at the beginning');
  workflow.next();
  test.equal(workflow.index, 0, 'set-1: workflow continues next to 0');
  workflow.next();
  test.equal(workflow.index, 0, 'set-1: workflow continues next to 0');

  workflow.reflowWith('set-2');
  workflow.first();
  test.equal(workflow.index, 1, 'set-2: workflow starts at 1');
  workflow.next();
  test.equal(workflow.index, 1, 'set-2: workflow continues next to 1');
  workflow.next();
  test.equal(workflow.index, 1, 'set-2: workflow continues next to 1');

  test.end();
});

test('Workflow | Scenario "Form Validation"', (test) => {

  var workflow = Workflow({
    'step1': {
      isValid: function() { return false; },
      content: {}
    },
    'step2': {
      isValid: function() { return true; },
      content: {}
    }
  });

  workflow.reflow().rule(function(requestedIndex, requestedItem) {
    if (!this.current().isValid()) {
      return this.index;
    }
  });

  workflow.next();
  test.equal(workflow.index, 0, 'the valid method at index 0, prevents progression');
  test.end();

});

test('Workflow | Scenario "User Permission"', (test) => {

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
  test.equal(workflow.index, 2, 'a next will scan to the next valid item');

  workflow.next();
  test.equal(workflow.index, 2, 'a next will not move because we would be out of bounds');

  workflow.previous();
  test.equal(workflow.index, 0, 'a previous will move us back to the previous permitted index');

  workflow.previous();
  test.equal(workflow.index, 0, 'a previous will not move because we would be out of bounds');
  test.end();

});

test('Workflow | Scenario "Isolated Parts"', (test) => {

  var workflow = Workflow([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  workflow.reflow('normal-progression');
  workflow.first();
  workflow.next();
  workflow.next();

  test.equal(workflow.index, 2, 'a normal progression of next() x 2 arrives at index 2');

  workflow.reflow('skip-odd').rule(function(requestIndex) {
    return (requestIndex % 2 === 0)
      ? requestIndex
      : requestIndex + 1;
  });

  workflow.reflowWith('skip-odd');
  workflow.first();
  workflow.next();
  workflow.next();

  test.equal(workflow.index, 4, 'a skip odd progression of next() x 2 arrives at index 4, skipping 1 and 3');

  // Apply a reflow object directly
  workflow.reflowWith(workflow.reflow().rule(function(requestIndex) {
    return requestIndex + 1
  }));

  workflow.first();
  workflow.next();
  workflow.next();

  test.equal(workflow.index, 5, 'a direct reflow should also apply');
  test.end();
});