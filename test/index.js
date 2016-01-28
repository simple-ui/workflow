import test from 'tape'
import _ from 'lodash'
import workflowAUI from '../lib'

test('Workflow.make Creation', (t) => {

  t.deepEqual((workflowAUI(2)).source, [0, 1], 'Number-based ss iterate as arrays');
  t.deepEqual((workflowAUI([2, 3])).source, [2, 3], 'Array-based ss iterate as arrays');
  t.deepEqual((workflowAUI({
    'a': 4,
    'b': 5
  })).source, {
    'a': 4,
    'b': 5
  }, 'Object-based ss iterate as objects');

  t.deepEqual((workflowAUI(2)).ordering, ['0', '1'], 'Number-based ss have array indices');
  t.deepEqual((workflowAUI([2, 3])).ordering, ['0', '1'], 'Array-based ss have array indices');
  t.deepEqual((workflowAUI({
    'a': 4,
    'b': 5
  })).ordering, ['a', 'b'], 'Object-based ss have array indices');
  t.end();

});

test('Workflow Index', (t) => {

  var workflow = workflowAUI([4, 2, 6, 7, 8]);

  t.equal(workflow.peekFirstIndex(), 0, 'First index is always zero');
  t.equal(workflow.peekLastIndex(), (workflow.size() - 1), 'Last index is one less than the size of the workflowAUI');
  t.equal(workflow.index, workflow.peekFirstIndex(), 'Index starts at peekFirstIndex');

  workflow.index = 1;
  t.equal(workflow.index, 1, 'Index moves current cursor');

  workflow.index = workflow.peekFirstIndex() - 1;
  t.equal(workflow.index, workflow.peekFirstIndex(), 'Bounded by lower peekFirstIndex');

  workflow.index = workflow.peekLastIndex() + 1;
  t.equal(workflow.index, workflow.peekLastIndex(), 'Bounded by upper peekLastIndex');

  workflow.index = 'invalid';
  t.equal(_.isNumber(workflow.index), true, 'An index will always be numeric');

  workflow.index = '1';
  t.equal(_.isNumber(workflow.index), true, 'An index can be a string of an integer');
  t.end();

});

test('Workflow Index Querying', (t) => {

  var workflow = workflowAUI([4, 2, 6, 7, 8]);

  workflow.index = 2;
  t.equal(workflow.current(), 6, 'Current points at the value of index');
  t.equal(workflow.peekPrevious(), 2, 'Previous points at the before value of index');
  t.equal(workflow.peekPreviousIndex(), 1, 'Previous Index points at the after index of index');
  t.equal(workflow.peekNext(), 7, 'Next points at the after value of index');
  t.equal(workflow.peekNextIndex(), 3, 'Next Index points at the after index of index');
  t.equal(workflow.peekFirst(), 4, 'First item is always at 0');
  t.equal(workflow.peekFirstIndex(), 0, 'First index is always 0');
  t.equal(workflow.peekLast(), 8, 'Last item is always at peekLastIndex');
  t.equal(workflow.peekLastIndex(), workflow.size() - 1, 'Last index is always one less than size');

  t.equal(workflow.previous(), 2, 'Move to previous item');
  t.equal(workflow.next(), 6, 'Move next, which is back to current item');
  t.equal(workflow.first(), 4, 'Move to first item');
  t.equal(workflow.last(), 8, 'Move to last item');
  t.end();

});

test('Workflow Index Management', (t) => {

  var workflow = workflowAUI([4, 2, 6, 7, 8]);

  workflow.first();
  t.equal(workflow.isFirst(), true, 'isFirst reports position');
  t.equal(workflow.isAfterFirst(), false, 'is after first');
  t.equal(workflow.isBeforeFirst(), false, 'is before first (only if an error occurs)');

  workflow.last();
  t.equal(workflow.isLast(), true, 'isFirst reports position');
  t.equal(workflow.isBeforeLast(), false, 'is before last');
  t.equal(workflow.isAfterLast(), false, 'is after last (only if an error occurs)');
  t.end();

});

test('Workflow Length', (t) => {

  var workflow;
  var array = [4, 2, 6, 7, 8];

  workflow = workflowAUI(array);
  t.equal(workflow.size(), array.length, 'is the size of the watched object');
  t.equal(workflow.length, array.length, 'is the size of the watched object');

  workflow = workflowAUI(4);
  t.equal(workflow.size(), 4, 'is the size of the watched object');
  t.equal(workflow.length, 4, 'is the size of the watched object');
  t.end();

});

test('Workflow Iterator Rules', (t) => {

  var workflow = workflowAUI([4, 2, 6, 7, 8]);

  t.equal(workflow.queryItem(1), 2, 'queryItem locates the item for an index');
  t.throws(workflow.queryItem(-1), undefined, 'queryItem fails when an item does not exist');
  t.equal(workflow.isAfterLast(0), false, 'queryisAfterLast is a new index after the last allowable index');
  t.equal(workflow.isBeforeFirst(1), false, 'queryIsBeforeFirst is a new index before the first allowable index');
  t.end();

});

test('Workflow Item', (t) => {

  var workflow = workflowAUI([4, 2, 6, 7, 8]);

  t.equal(workflow.seekItem(0), 4, 'item retrieves the current value');
  t.equal(workflow.seekItem(-1), workflow.first(), 'item returns first for invalid low indices');
  t.equal(workflow.seekItem(workflow.peekLastIndex() + 1), workflow.last(), 'item returns last for invalid high indices');

  t.equal(workflow.peekItem(0), 4, 'peek item retrieves the current value');
  t.equal(workflow.peekItem(-1), undefined, 'peek item returns undefined for invalid values (too low)');
  t.equal(workflow.peekItem(workflow.peekLastIndex() + 1), undefined, 'peek item returns undefined for invalid values (too high)');
  t.end();

});

test('Workflow Empty', (t) => {

  var workflow = workflowAUI();

  t.equal(workflow.peekFirstIndex(), workflow.peekLastIndex(), 'the first and last index are the same, there is no data');
  t.equal(workflow.current(), undefined, 'all item selectors will return undefined');
  t.end();

});

test('Workflow Reflow', (t) => {

  var workflow = workflowAUI([3, 4, 5, 6, 7, 8]);

  workflow.reflow(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 3;
    }
  });

  workflow.index = 1;
  t.equal(workflow.index, 1, 'reflow allows 1');

  workflow.index = 2;
  t.equal(workflow.index, 3, 'reflow from 2 to 3');

  workflow.index = 3;
  t.equal(workflow.index, 3, 'reflow allows 3');

  t.end();

});

test('Workflow Reflow Multiple Rules', (t) => {

  var workflow = workflowAUI([3, 4, 5, 6, 7, 8]);

  workflow.reflow(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 3;
    }
  });

  workflow.reflow(function(requestedIndex) {
    if (requestedIndex === 3) {
      return 1;
    }
  });

  workflow.index = 1;
  t.equal(workflow.index, 1, 'reflow allows 1');

  workflow.index = 2;
  t.equal(workflow.index, 3, 'reflow from 2 to 3');

  workflow.index = 3;
  t.equal(workflow.index, 1, 'reflow from 3 to 1');

  workflow.index = 4;
  t.equal(workflow.index, 4, 'reflow allows 4');

  t.end();

});


test('Workflow Reflow Overriden Rule', (t) => {

  var workflow = workflowAUI([3, 4, 5, 6, 7, 8]);

  workflow.reflow(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 3;
    }
  });

  workflow.reflow(function(requestedIndex) {
    if (requestedIndex === 2) {
      return 0;
    }
  });

  workflow.index = 1;
  t.equal(workflow.index, 1, 'reflow allows 1');

  workflow.index = 2;
  t.equal(workflow.index, 0, 'reflow from 2 to 0, because the most recent reflow rule overrides all previous rules');

  workflow.index = 3;
  t.equal(workflow.index, 3, 'reflow allows 3');

  workflow.index = 4;
  t.equal(workflow.index, 4, 'reflow allows 4');

  t.end();

});

