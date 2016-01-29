import _ from 'lodash';

/*
 * An iterator-like API for workflows
 *
 * @module adaptiveui/workflow
 * @license
 * adaptiveui\auiWorkflow 1.0.0 <https://adaptiveui.io/>
 * Copyright 2016 Adaptive UI <https://adaptiveui.io/>
 * Available under MIT license <https://adaptiveui.io/license>
 */
export default function Workflow(source) {

  if (!(this instanceof Workflow)) {
    return new Workflow(source);
  }

  this.__reflow__ = [];
  this.source = source;
  this.index = this.peekFirstIndex();
};

Workflow.prototype = {

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

    requestedIndex = this.reflowIndex(requestedIndex);

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

  /* @return {*} the item at the previous index (or undefined, if too low) */
  peekPrevious() {
    return this.peekItem(this.peekPreviousIndex());
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

  /* @return {*} the item at the next index (or undefined, if too high) */
  peekNext() {
    return this.peekItem(this.peekNextIndex());
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

  /* @return {*} item at the current index (or bounded to first or last if the index provided is out of bounds) and change the current index */
  seekItem(index) {
    this.index = index;
    return this.queryItem(this.index);
  },

  /* @return {*|Undefined} item at the current index or undefined, if the index is out of bounds */
  peekItem(index) {
    return (this.isIndexBounded(index))
      ? this.queryItem(index)
      : undefined;
  },

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
   * add a reflow rule at a specific index (assignment index)
   * @param {Number} index the index to control flow at
   * @param {Function} orderFn the function to control order with
   */
  reflowAt(index, orderFn) {

    // TODO throw this error inside of isIndexBounded
    // NOTE allowing the index to assign out of bounds and not failing is part of what Workflow does
    if (!this.isIndexBounded(index)) {
      throw new Error('Workflow: index out of bounds');
    }

    return this.reflow(function(requestedIndex) {
      if (requestedIndex === index) {
        return orderFn(requestedIndex);
      }
    });
  },

  /*
   * add a reflow rule with precendence above all previous reflow rules
   * @param {Function} orderFn the function to control order with
   */
  reflow(orderFn) {
    this.__reflow__.push(orderFn);
    return this;
  },

  /* @return {Number| the new index after a reflow */
  reflowIndex(requestedIndex) {

    const reflow = this.__reflow__;
    var i = reflow.length;
    var value;

    // NOTE we reverse iterate so we can push in reflow / performance
    while (i--) {
      value = (reflow[i]).call(this, requestedIndex);
      if (!_.isUndefined(value)) {
        return value;
      }
    }

    return requestedIndex;
  },

  /*
   * @return {String} source of workflow
   */
  toString() {
    // TODO add the current index and value
    return (this.__source__.toString());
  }

};