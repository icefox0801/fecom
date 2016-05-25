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
    return fecom.parse(semantic);
  });

  if (fs.existsSync(componentDir)) {
    files = fs.readdirSync(componentDir);
  }

  return Promise.all(files.map(function (file) {
    var schema = {
      name: file,
      owner: fecom.config.owner,
      specified: true
    };
    var specified = ~_.findIndex(dependencies, schema);
    schema.specified = Boolean(specified);
    return fecom.async(new Component(schema, 'local'));
  }));
};