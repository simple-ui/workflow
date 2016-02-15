var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

import _ from 'lodash'
import Workflow from '../lib'

var initializeWith = {
  size: 10,
  array: _.times(10),
  object: _.zipObject(_.times(10), _.times(10))
};

var workflow = Workflow([1, 2, 3, 4, 5, 6, 7]);
var reflowed = Workflow([1, 2, 3, 4, 5, 6, 7]);
var reflowFn = function(i) {
  return i;
};

reflowed.reflow().rule(reflowFn);

suite.add('Workflow#index (set)', function() {
  workflow.index = 1;
}).add('Workflow#index (get)', function() {
  workflow.index;
}).add('Workflow#create (array)', function() {
  Workflow(initializeWith.array);
}).add('Workflow#create (size)', function() {
  Workflow(initializeWith.size);
}).add('Workflow#create (object)', function() {
  Workflow(initializeWith.object);
}).add('Workflow#current', function() {
  workflow.current();
}).add('Workflow#next', function() {
  workflow.next();
}).add('Workflow#peekNext', function() {
  workflow.peekNext();
}).add('Workflow#first', function() {
  workflow.first();
}).add('Workflow#peekFirst', function() {
  workflow.peekFirst();
}).add('Workflow#isIndexBounded', function() {
  workflow.isIndexBounded(1);
}).add('Workflow#index (set/reflow)', function() {
  reflowed.index = 1;
}).add('Workflow#index (get/reflow)', function() {
  reflowed.index;
}).add('Workflow#reflow', function() {
  workflow.reflow().rule(reflowFn);
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run({
  'async': true
});