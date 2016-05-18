'use strict';

var path = require('path');

var fs = require('graceful-fs');

var fecom = require('../fecom');
var Component = require('./Component');

module.exports = function (parsedList) {

  if (!parsedList.length) {
    parsedList = fecom.config.dependencies;
  }

  if (!parsedList.length) {
    throw new Error('No component to install');
  }

  return Promise.all(parsedList.map(function (parsed) {
    return fecom.async(new Component(parsed, 'remote'));
  }));
};