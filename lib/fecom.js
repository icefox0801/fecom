'use strict';

var _ = require('lodash');
var YAML = require('yamljs');

var Fecom = function (options) {
  this.lang = {};
  this.options = _.assign({}, Fecom.defaults, options);
  this.setLanguage(options.locale);
};

Fecom.defaults = {
  locale: 'en'
};

Fecom.prototype = {
  constructor: Fecom,
  initialize: function () {
    var self = this;
    self.setLanguage();
  },
  setLanguage: function () {
    var self = this;
    var languages = YAML.load('../i18n/lang.yml');
  }
};

module.exports = new Fecom();