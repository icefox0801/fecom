'use strict';

var path = require('path');

var fs = require('graceful-fs');

var fecom = require('../fecom');
var Component = require('./Component');

module.exports = function () {
  var componentDir = fecom.componentRoot;
  var files = [];

  if (fs.existsSync(componentDir)) {
    files = fs.readdirSync(componentDir);
  }

  return Promise.all(files.map(function (file) {
    var schema = {
      name: file,
      owner: fecom.config.owner
    };
    return fecom.async(new Component(schema, 'local'));
  }));
};