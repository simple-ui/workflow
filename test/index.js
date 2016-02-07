import test from 'tape'
import _ from 'lodash'
import workflow from '../lib'

test('Workflow Creation', (test) => {

  test.deepEqual((workflow(2)).source, [0, 1], 'Number-based ss iterate as arrays');
  test.deepEqual((workflow([2, 3])).source, [2, 3], 'Array-based ss iterate as arrays');
  test.deepEqual((workflow({
    'a': 4,
    'b': 5
  })).source, {
    'a': 4,
    'b': 5
  }, 'Object-based ss iterate as objects');

  test.deepEqual((workflow(2)).ordering, ['0', '1'], 'Number-based ss have array indices');
  test.deepEqual((workflow([2, 3])).ordering, ['0', '1'], 'Array-based ss have array indices');
  test.deepEqual((workflow({
    'a': 4,
    'b': 5
  })).ordering, ['a', 'b'], 'Object-based ss have array indices');
  test.end();

});

test('Workflow Index', (test) => {

  var flow = workflow([4, 2, 6, 7, 8]);

  test.equal(flow.peekFirstIndex(), 0, 'First index is always zero');
  test.equal(flow.peekLastIndex(), (flow.size() - 1), 'Last index is one less than the size of the workflow');
  test.equal(flow.index, flow.peekFirstIndex(), 'Index starts at peekFirstIndex');

  flow.index = 1;
  test.equal(flow.index, 1, 'Index moves current cursor');

  flow.index = flow.peekFirstIndex() - 1;
  test.equal(flow.index, flow.peekFirstIndex(), 'Bounded by lower peekFirstIndex');

  flow.index = flow.peekLastIndex() + 1;
  test.equal(flow.index, flow.peekLastIndex(), 'Bounded by upper peekLastIndex');

  flow.index = 'invalid';
  test.equal(_.isNumber(flow.index), true, 'An index will always be numeric');

  flow.index = '1';
  test.equal(_.isNumber(flow.index), true, 'An index can be a string of an integer');
  test.end();

});

test('Workflow Index Querying', (test) => {

  var flow = workflow([4, 2, 6, 7, 8]);

  flow.index = 2;
  test.equal(flow.current(), 6, 'Current points at the value of index');
  test.equal(flow.peekPrevious(), 2, 'Previous points at the before value of index');
  test.equal(flow.peekPreviousIndex(), 1, 'Previous Index points at the after index of index');
  test.equal(flow.peekNext(), 7, 'Next points at the after value of index');
  test.equal(flow.peekNextIndex(), 3, 'Next Index points at the after index of index');
  test.equal(flow.peekFirst(), 4, 'First item is always at 0');
  test.equal(flow.peekFirstIndex(), 0, 'First index is always 0');
  test.equal(flow.peekLast(), 8, 'Last item is always at peekLastIndex');
  test.equal(flow.peekLastIndex(), flow.size() - 1, 'Last index is always one less than size');

  test.equal(flow.previous(), 2, 'Move to previous item');
  test.equal(flow.next(), 6, 'Move next, which is back to current item');
  test.equal(flow.first(), 4, 'Move to first item');
  test.equal(flow.last(), 8, 'Move to last item');
  test.end();

});

test('Workflow Index Management', (test) => {

  var flow = workflow([4, 2, 6, 7, 8]);

  flow.first();
  test.equal(flow.isFirst(), true, 'isFirst reports position');
  test.equal(flow.isAfterFirst(), false, 'is after first');
  test.equal(flow.isBeforeFirst(), false, 'is before first (only if an error occurs)');

  flow.last();
  test.equal(flow.isLast(), true, 'isFirst reports position');
  test.equal(flow.isBeforeLast(), false, 'is before last');
  test.equal(flow.isAfterLast(), false, 'is after last (only if an error occurs)');
  test.end();

});

test('Workflow Length', (test) => {

  var flow;
  var array = [4, 2, 6, 7, 8];

  flow = workflow(array);
  test.equal(flow.size(), array.length, 'is the size of the watched object');
  test.equal(flow.length, array.length, 'is the size of the watched object');

  flow = workflow(4);
  test.equal(flow.size(), 4, 'is the size of the watched object');
  test.equal(flow.length, 4, 'is the size of the watched object');
  test.end();

});

test('Workflow Iterator Rules', (test) => {

  var flow = workflow([4, 2, 6, 7, 8]);

  test.equal(flow.queryItem(1), 2, 'queryItem locates the item for an index');
  test.throws(flow.queryItem(-1), undefined, 'queryItem fails when an item does not exist');
  test.equal(flow.isAfterLast(0), false, 'queryisAfterLast is a new index after the last allowable index');
  test.equal(flow.isBeforeFirst(1), false, 'queryIsBeforeFirst is a new index before the first allowable index');
  test.end();

});

test('Workflow Item', (test) => {

  var flow = workflow([4, 2, 6, 7, 8]);

  test.equal(flow.seekItem(0), 4, 'item retrieves the current value');
  test.equal(flow.seekItem(-1), flow.first(), 'item returns first for invalid low indices');
  test.equal(flow.seekItem(flow.peekLastIndex() + 1), flow.last(), 'item returns last for invalid high indices');

  test.equal(flow.peekItem(0), 4, 'peek item retrieves the current value');
  test.equal(flow.peekItem(-1), flow.OUT_OF_BOUNDS, 'peek item returns OUT_OF_BOUNDS for invalid values (too low)');
  test.equal(flow.peekItem(flow.peekLastIndex() + 1), flow.OUT_OF_BOUNDS, 'peek item returns OUT_OF_BOUNDS for invalid values (too high)');
  test.end();

});

test('Workflow Empty', (test) => {

  var flow = workflow();

  test.equal(flow.peekFirstIndex(), flow.peekLastIndex(), 'the first and last index are the same, there is no data');
  test.equal(flow.current(), undefined, 'all item selectors will return undefined');
  test.end();

});

test('Workflow Scan', (test) => {

  var flow = workflow([false, false, true, false, true]);

  test.equal(flow.index, flow.peekFirstIndex(), 'flow starts at first');

  flow.index = flow.scanNextIndex(function(index, item) {
    return item;
  });
  test.equal(flow.index, 2, 'flow scans to 2, because a boolean true is at that point');

  flow.index = flow.scanNextIndex(function(index, item) {
    return item;
  });
  test.equal(flow.index, 4, 'flow scans to 4, because a boolean true is at that point');

  var index = flow.scanNextIndex(function(index, item) {
    return item;
  });
  test.equal(index, flow.OUT_OF_BOUNDS, 'scan retruns undefined because there are no valid indices to scan to');

  flow.index = flow.scanPreviousIndex(function(index, item) {
    return item;
  });
  test.equal(flow.index, 2, 'flow scans to 2, because a boolean true is at that point');

  test.end();

});

test('Workflow#toString', (test) => {

  var flow = workflow([1, 2, 3, 4]);

  flow.index = 0;
  test.equal(flow.toString(), '[1,2,3,4] | 0 | 1', 'toString shows workflow, index and current value');

  flow.index = 1;
  test.equal(flow.toString(), '[1,2,3,4] | 1 | 2', 'toString shows workflow, index and current value at any index');
  test.end();

});

test('Workflow Reflow', (test) => {

  var flow = workflow([3, 4, 5, 6, 7, 8]);

  flow.reflow(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 3;
    }
  });

  flow.index = 1;
  test.equal(flow.index, 1, 'reflow allows 1');

  flow.index = 2;
  test.equal(flow.index, 3, 'reflow from 2 to 3');

  flow.index = 3;
  test.equal(flow.index, 3, 'reflow allows 3');

  test.end();

});

test('Workflow Reflow Multiple Rules', (test) => {

  var flow = workflow([3, 4, 5, 6, 7, 8]);

  flow.reflow(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 3;
    }
  });

  flow.reflow(function(requestedIndex) {
    if (requestedIndex === 3) {
      return 1;
    }
  });

  flow.index = 1;
  test.equal(flow.index, 1, 'reflow allows 1');

  flow.index = 2;
  test.equal(flow.index, 3, 'reflow from 2 to 3');

  flow.index = 3;
  test.equal(flow.index, 1, 'reflow from 3 to 1');

  flow.index = 4;
  test.equal(flow.index, 4, 'reflow allows 4');

  test.end();

});


test('Workflow Reflow Overriden Rule', (test) => {

  var flow = workflow([3, 4, 5, 6, 7, 8]);

  flow.reflow(function(requestedIndex, requestedItem) {
    if (requestedIndex === 2) {
      test.equal(requestedItem, 5, 'item at index 2 is 5, and is passed in the reflow');
      return 3;
    }
  });

  flow.reflow(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 0;
    }
  });

  flow.index = 1;
  test.equal(flow.index, 1, 'reflow allows 1');

  flow.index = 2;
  test.equal(flow.index, 0, 'reflow from 2 to 0, because the most recent reflow rule overrides all previous rules');

  flow.index = 3;
  test.equal(flow.index, 3, 'reflow allows 3');

  flow.index = 4;
  test.equal(flow.index, 4, 'reflow allows 4');

  test.end();

});


test('Workflow | Scenario "Form Validation"', (test) => {

  var flow = workflow({
    'step1': {
      isValid: function() { return false; },
      content: {}
    },
    'step2': {
      isValid: function() { return true; },
      content: {}
    }
  });

  flow.reflow(function(requestedIndex, requestedItem) {
    if (!this.current().isValid()) {
      return this.index;
    }
  });

  flow.next();
  test.equal(flow.index, 0, 'the valid method at index 0, prevents progression');
  test.end();

});


test('Workflow | Scenario "User Permission"', (test) => {

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
  flow.reflow(function(requestedIndex) {

    return this.scanIndex(function(scanIndex, scanItem) {
      return scanItem.isPermitted;
    }, (requestedIndex < this.index) ? -1 : 1);

  });

  flow.next();
  test.equal(flow.index, 2, 'a next will scan to the next valid item');

  flow.next();
  test.equal(flow.index, 2, 'a next will not move because we would be out of bounds');

  flow.previous();
  test.equal(flow.index, 0, 'a previous will move us back to the previous permitted index');

  flow.previous();
  test.equal(flow.index, 0, 'a previous will not move because we would be out of bounds');
  test.end();

});
