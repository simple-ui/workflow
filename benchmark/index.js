var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

import _ from 'lodash'
import workflow from '../lib'

var initializeWith = {
  size: 10,
  array: _.times(10),
  object: _.zipObject(_.times(10), _.times(10))
};

var flow = workflow([1, 2, 3, 4, 5, 6, 7]);
var reflowed = workflow([1, 2, 3, 4, 5, 6, 7]);
var reflowFn = function(i) {
  return i;
};

reflowed.reflow(reflowFn);

suite.add('workflow#index (set)', function() {
  flow.index = 1;
}).add('workflow#index (get)', function() {
  flow.index;
}).add('workflow#create (array)', function() {
  workflow(initializeWith.array);
}).add('workflow#create (size)', function() {
  workflow(initializeWith.size);
}).add('workflow#create (object)', function() {
  workflow(initializeWith.object);
}).add('workflow#current', function() {
  flow.current();
}).add('workflow#next', function() {
  flow.next();
}).add('workflow#peekNext', function() {
  flow.peekNext();
}).add('workflow#first', function() {
  flow.first();
}).add('workflow#peekFirst', function() {
  flow.peekFirst();
}).add('workflow#isIndexBounded', function() {
  flow.isIndexBounded(1);
}).add('workflow#index (set/reflow)', function() {
  reflowed.index = 1;
}).add('workflow#index (get/reflow)', function() {
  reflowed.index;
}).add('workflow#reflow', function() {
  flow.reflow(reflowFn);
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run({
  'async': true
});