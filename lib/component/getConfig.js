'use strict';

var path = require('path');

var fs = require('graceful-fs');
var jsonfile = require('jsonfile');

var fecom = require('../fecom');

module.exports = function () {
  var componentJson = path.join(fecom.root, 'component.json');
  var json = {};

  if (fs.existsSync(componentJson)) {
    json = jsonfile.readFileSync(componentJson);
  }

  return fecom.async(json);
};