import _ from 'lodash';

/*
 * A set of rules dictating how an external index maps to an internal index
 *
 * @module @adaptiveui/reflow
 * @license
 * @adaptiveui/reflow 1.0.0 <https://adaptiveui.io/>
 * Copyright 2016 Adaptive UI <https://adaptiveui.io/>
 * Available under MIT license <https://adaptiveui.io/license>
 */
function Reflow() {
  this.__rules__ = [];
};

Reflow.prototype = {

  /* @return {Number} the new index after a reflow */
  rulesReflowIndex(workflow, requestedIndex) {

    const rules = this.__rules__;
    const requestedItem = workflow.queryItem(requestedIndex);
    var i = rules.length;
    var value;

    // NOTE we reverse iterate so we can use push, in the reflow method, and decrement i, for performance
    while (i--) {

      value = (rules[i]).call(workflow, requestedIndex, requestedItem);

      if (workflow.isOutOfBounds(value)) {
        return workflow.index;
      }
      // NOTE undefined means the reflow did not have an opinion about this index
      else if (!_.isUndefined(value)) {
        return value;
      }
    }

    return requestedIndex;
  },

  /*
   * add a reflow rule at a specific index (assignment index)
   * @param {Number} index the index to control flow at
   * @param {Function} orderFn the function to control order with
   * @note allows index to be out of bounds because the workflow may grow
   */
  ruleAt(index, orderFn) {
    return this.rule(function(requestedIndex) {
      if (requestedIndex === index) {
        // NOTE closure will be cleaned because reflow functions are stored on the flow
        return orderFn.call(this, requestedIndex);
      }
    });
  },

  /*
   * add a reflow rule with precendence above all previous reflow rules
   * @param {Function} orderFn the function to control order with
   */
  rule(orderFn) {
    this.__rules__.push(orderFn);
    return this;
  }

};

/*
 * Workflow is a utility to model logic-driven, state-based workflows
 *
 * @module @adaptiveui/workflow
 * @license
 * @adaptiveui/workflow 1.0.0 <https://adaptiveui.io/>
 * Copyright 2016 Adaptive UI <https://adaptiveui.io/>
 * Available under MIT license <https://adaptiveui.io/license>
 */
export default function Workflow(source) {

  if (!(this instanceof Workflow)) {
    return new Workflow(source);
  }

  this.__reflow__ = undefined;
  this.__reflows__ = [];
  this.source = source;
  this.index = this.peekFirstIndex();
};

Workflow.create = function createWorkflow(source) {
  return new Workflow(source);
};

Workflow.prototype = {

  /* out of bounds value on peek and scan */
  OUT_OF_BOUNDS: -1,

  /* @return the source object the auiWorkflow iterates over */
  get source() {
    return this.__source__;
  },

  /* assign the source object the auiWorkflow iterates over */
  set source(externalSource) {

    if (_.isArray(externalSource)) {
      this.__source__ = externalSource;
    }
    else if (_.isPlainObject(externalSource)) {
      this.__source__ = externalSource;
    }
    else if (_.isNumber(externalSource)) {
      this.__source__ = _.times(parseInt(externalSource, 10));
    }
    else {
      this.__source__ = [];
    }

    this.__ordering__ = _.keys(this.__source__);
  },

  /* @return {Number} current valid index */
  get index() {
    return this.__index__;
  },

  get ordering() {
    return this.__ordering__;
  },

  /*
   * @param {Number} requestIndex index to change to
   */
  set index(requestedIndex) {

    requestedIndex = parseInt(requestedIndex, 10);

    if (!_.isNumber(requestedIndex)) {
      return;
    }

    if (!!this.__reflow__) {
      requestedIndex = this.__reflow__.rulesReflowIndex(this, requestedIndex);
    }

    if (requestedIndex < this.peekFirstIndex()) {
      this.__index__ = this.peekFirstIndex();
    }
    else if (requestedIndex > this.peekLastIndex()) {
      this.__index__ = this.peekLastIndex();
    }
    else {
      this.__index__ = requestedIndex;
    }
  },

  /* @return {*} the item at the current index */
  current() {
    return this.queryItem(this.index);
  },

  /* @return {*} the item at the previous index and advance the index (or first, if the index is too low) */
  previous() {
    return this.seekItem(this.peekPreviousIndex());
  },

  /* @return {Boolean} true, if a previous item exists */
  hasPrevious() {
    return this.peekPreviousIndex() >= this.peekFirstIndex();
  },

  /* @return {*} the item at the previous index (or OUT_OF_BOUNDS, if too low) */
  peekPrevious() {
    return this.peekItem(this.peekPreviousIndex());
  },

  /*
   * search from current index until condition returns true
   * @param {Function} conditionFn a function called (index, item), if true, then we have found our item
   * @return {Integer} the first previous index satisfying the condition
   */
  scanPreviousIndex(conditionFn) {
    return this.scanIndex(conditionFn, -1);
  },

  /* @return {Number} the previous index */
  peekPreviousIndex() {
    return this.queryPreviousIndex(this.index);
  },

  /* @return {*} the item at the next index and advance the index (or last, if the index is too high) */
  next() {
    return this.seekItem(this.peekNextIndex());
  },

  /* @return {Boolean} true, if next item exists */
  hasNext() {
    return this.peekNextIndex() <= this.peekLastIndex();
  },

  /* @return {*} the item at the next index (or OUT_OF_BOUNDS, if too high) */
  peekNext() {
    return this.peekItem(this.peekNextIndex());
  },

  /*
   * search from current index until condition returns true
   * @param {Function} conditionFn a function called (index, item), if true, then we have found our item
   * @return {Integer} the first next index satisfying the condition
   */
  scanNextIndex(conditionFn) {
    return this.scanIndex(conditionFn, 1);
  },

  /* @return {Number} the next index */
  peekNextIndex() {
    return this.queryNextIndex(this.index);
  },

  /* @return {*} the first item and advance the index to the first index */
  first() {
    return this.seekItem(this.peekFirstIndex());
  },

  /* @return {Boolean} true, if index is at the first index */
  isFirst() {
    return this.index === this.peekFirstIndex();
  },

  /* @return {Boolean} true, if index is after first index */
  isAfterFirst() {
    return this.index > this.peekFirstIndex();
  },

  /* @return {Boolean} true, if index is before first index */
  isBeforeFirst() {
    return this.index < this.peekFirstIndex();
  },

  /* @alias auiWorkflow#first */
  peekFirst() {
    return this.peekItem(this.peekFirstIndex());
  },

  /* @return {Number} the first index (or -1 if auiWorkflow is empty) */
  peekFirstIndex() {
    return this.queryFirstIndex();
  },

  /* @return {*} the last item and advance the index to the last index */
  last() {
    return this.seekItem(this.peekLastIndex());
  },

  /* @return {Boolean} true, if index is at the last index */
  isLast() {
    return this.index === this.peekLastIndex();
  },

  /* @return {Boolean} true, if index is after last index (if true, then the auiWorkflow is in error) */
  isAfterLast() {
    return this.index > this.peekLastIndex();
  },

  /* @return {Boolean} true, if index is before last index */
  isBeforeLast() {
    return this.index < this.peekLastIndex();
  },

  /* @alias auiWorkflow#last */
  peekLast() {
    return this.peekItem(this.peekLastIndex());
  },

  /* @return {Boolean} the last index (or -1 if auiWorkflow is empty) */
  peekLastIndex() {
    return this.queryLastIndex();
  },

  /* @return {Number} the length of the workflow */
  get length() {
    return this.__ordering__.length;
  },

  /* @alias auiWorkflow#length */
  size() {
    return this.length;
  },

  /*
   * search from current index until condition returns true
   * @param {Function} conditionFn a function called (index, item), if true, then we have found our item
   * @param {Integer} progressionIncrement to move along the workflow
   * @return {Integer} the first index satisfying the condition
   */
  scanIndex(conditionFn, progressionIncrement = 1) {

    var scanIndex = (progressionIncrement > 0)
      ? this.peekNextIndex()
      : this.peekPreviousIndex();

    while (this.isIndexBounded(scanIndex)) {
      if (conditionFn.call(this, scanIndex, this.peekItem(scanIndex))) {
        return scanIndex;
      }
      scanIndex += progressionIncrement;
    }

    return this.OUT_OF_BOUNDS;
  },

  /* @return {*} item at the current index (or bounded to first or last if the index provided is out of bounds) and change the current index */
  seekItem(index) {
    this.index = index;
    return this.queryItem(this.index);
  },

  /* @return {*|OUT_OF_BOUNDS} item at the current index or OUT_OF_BOUNDS, if the index is out of bounds */
  peekItem(index) {
    return (this.isIndexBounded(index))
      ? this.queryItem(index)
      : this.OUT_OF_BOUNDS;
  },

  /* @return {Boolean} true if index is OUT_OF_BOUNDS */
  isOutOfBounds: function(index) {
    return index === this.OUT_OF_BOUNDS;
  },

  /* @return {Boolean} true, if index is inside of first/last index */
  isIndexBounded(index) {
    return (index >= this.queryFirstIndex() && index <= this.queryLastIndex());
  },

  /*
   * lookup item at index
   * @access protected
   * @throws {ErrorException} if the index is out of bounds
   * @return {*} the source object for the current index
   */
  queryItem(index) {
    return this.source[this.__ordering__[index]];
  },

  /*
   * @access protected
   * @return {Number} first index
   */
  queryFirstIndex() {
    return (this.length > 0)
      ? 0
      : -1;
  },

  /*
   * @access protected
   * @return {Number} last index
   */
  queryLastIndex() {
    return this.length - 1;
  },

  /*
   * @access protected
   * @return {Number} next index from Workflow#index
   */
  queryNextIndex(index) {
    return index + 1;
  },

  /*
   * @access protected
   * @return {Number} previous index from Workflow#index
   */
  queryPreviousIndex(index) {
    return index - 1;
  },

  /*
   * assign the current reflow ruleset
   * @param reflowName {String} [Optional] the name of the reflow
   * @return {Workflow} the current workflow
   */
  reflowWith(reflowName) {

    if (_.isString(reflowName)) {
      this.__reflow__ = this.__reflows__[reflowName];
    }
    else if (reflowName instanceof Reflow) {
      this.__reflow__ = reflowName;
    }
    else if (_.isUndefined(reflowName)) {
      this.__reflow__ = undefined;
    }

    return this;
  },

  /*
   * create a new reflow and assign it as the current reflow
   * @param reflowName {String} [Optional] the name of the reflow
   * @return {Reflow} a new reflow
   */
  reflow(reflowName) {

    var reflow = this.__reflow__ = new Reflow();

    if (_.isString(reflowName)) {
      this.__reflows__[reflowName] = reflow;
    }

    return reflow;
  },

  /*
   * @return {String} source of workflow
   */
  toString() {
    return [JSON.stringify(this.__source__), this.index, JSON.stringify(this.current())].join(' | ');
  }

};
