'use strict';

var path = require('path');

var fs = require('graceful-fs');

var fecom = require('../fecom');
var Component = require('./Component');

module.exports = function (parsedList) {

  if (!parsedList.length) {
    parsedList = fecom.config.dependencies || [];
    parsedList = parsedList.map(function (str) {
      return fecom.parse(str);
    });
  }

  if (!parsedList.length) {
    throw new Error(fecom.i18n('NO_COMPONENT_TO_INSTALL'));
  }

  parsedList = parsedList.map(function (parsed) {
    parsed.specified = true;
    return parsed;
  });

  return Promise.all(parsedList.map(function (parsed) {
    return fecom.async(new Component(parsed, 'remote'));
  }));
};