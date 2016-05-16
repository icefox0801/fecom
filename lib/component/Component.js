'use strict';

var path = require('path');

var _ = require('lodash');
var jsonfile = require('jsonfile');

var Component = function (name, dir, options) {
  this.name = name;
  this.author = '';
  this.version = '';
  this.status = 'ok';
  this.fullPath = path.join(dir, name);
  this.options = _.assign({}, Component.defaults, options);
  this.initialize();
};

Component.defaults = {};

Component.prototype = {
  constructor: Component,
  initialize: function () {
    var self = this;
    var json = jsonfile.readFileSync(path.join(self.fullPath, 'component.json'));
    self.version = json.version;
    self.author = json.author;
  }
};

module.exports = Component;