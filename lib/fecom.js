'use strict';

var _ = require('lodash');

var Fecom = function (options) {
  this.lang = {};
  this.options = _.assign({}, Fecom.defaults, options);
};

Fecom.defaults = {};

Fecom.prototype = {
  constructor: Fecom,
  initialize: function () {
  }
};

module.exports = new Fecom();