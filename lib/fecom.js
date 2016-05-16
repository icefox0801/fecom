'use strict';

var path = require('path');
var EventEmitter = require('events');
var util = require('util');

var _ = require('lodash');
var osLocale = require('os-locale');
var YAML = require('yamljs');

var logger = require('./util/logger');
var promisify = require('./util/promisify');

var Fecom = function (options) {
  options = options || {};
  this.profile = null;
  this.config = _.assign({}, Fecom.defaults.config, options.config);
  this.locale = osLocale.sync();
  this.lang = YAML.load(path.join(__dirname, '../i18n/lang.yml'));
  EventEmitter.call(this);
  this.initialize();
};

util.inherits(Fecom, EventEmitter);

Fecom.defaults = {
  config: {
    protocol: 'gitlab',
    author: 'fecom-fe',
    domain: 'http://gitlab.58corp.com'
  }
};

Fecom.prototype = _.assign(Fecom.prototype, {
  initialize: function () {
    // Initialize Fecom instance
  },
  i18n: function (key) {
    var self = this;
    var entity = self.lang[key];
    return (entity.hasOwnProperty(self.locale)) ? entity[self.locale] : entity['en-US'];
  },
  logger: logger,
  async: promisify
});

module.exports = new Fecom();