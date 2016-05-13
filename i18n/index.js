'use strict';

var path = require('path');
var osLocale = require('os-locale');
var YAML = require('yamljs');

var locale = osLocale.sync();
var lang = YAML.load(path.join(__dirname, 'lang.yml'));

module.exports = function (key) {
  var entity = lang[key];
  return (entity.hasOwnProperty(locale)) ? entity[locale] : entity['en-US'];
};