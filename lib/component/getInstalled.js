'use strict';

var path = require('path');

var fs = require('graceful-fs');

var fecom = require('../fecom');
var Component = require('./Component');

module.exports = function () {
  var componentDir = path.resolve(fecom.config.dir);
  var files = fs.readdirSync(componentDir);

  return Promise.all(files.map(function (file) {
    return fecom.async(new Component(file, fecom.config.dir, {}));
  }));
};