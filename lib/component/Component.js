'use strict';

var path = require('path');

var _ = require('lodash');
var jsonfile = require('jsonfile');

var fecom = require('../fecom');
var gitlabRepo = require('../remote/gitlab');

var Component = function (parsed, type, options) {

  if (!parsed.hasOwnProperty('name')) {
    throw new Error('Component name must be defined');
  }

  if (!parsed.hasOwnProperty('owner')) {
    throw new Error('Component owner must be defined');
  }

  this.name = parsed.name;
  this.owner = parsed.owner;
  this.version = parsed.version || '';
  this.author = '';
  this.fresh = true;
  this.type = type;
  this.fullPath = path.join(fecom.componentDir, parsed.name);
  this.options = _.assign({}, Component.defaults, options);
  this.initialize();
};

Component.defaults = {};

Component.prototype = {
  constructor: Component,
  initialize: function () {
    // Initializing a component
    var self = this;

    if ('local' === self.type) {
      var json = jsonfile.readFileSync(path.join(self.fullPath, 'component.json'));
      self.version = json.version;
      self.author = json.author;
    }

  },
  validate: function () {
    // Validate installed component
    var self = this;
    return gitlabRepo.validate(self.author, self.projectName)
      .then();
  },
  install: function () {
    // Install component
    var self = this;
    return gitlabRepo.getArchive(self.author, self.projectName, self.version)
      .then(function () {
      });
  }
};

module.exports = Component;