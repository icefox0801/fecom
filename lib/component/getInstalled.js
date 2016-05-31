'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');

var fecom = require('../fecom');
var Component = require('./Component');

module.exports = function () {
  var componentDir = fecom.componentRoot;
  var files = [];
  var dependencies = fecom.config.dependencies || [];
  dependencies = dependencies.map(function (semantic) {
    var parsed = fecom.parse(semantic);

    if (!(parsed.hasOwnProperty('resolved') && parsed.resolved)) {
      parsed.specified = true;
    }

    return parsed;
  });

  if (fs.existsSync(componentDir)) {
    files = fs.readdirSync(componentDir);
  }

  return Promise.all(files.map(function (file) {
    var matched = _.find(dependencies, { name: file }) || {};

    var schema = {
      name: file,
      owner: matched.owner || fecom.config.owner,
      specified: Boolean(matched.specified),
      resolved: Boolean(matched.resolved)
    };

    return fecom.async(new Component(schema, 'local'));
  }));
};