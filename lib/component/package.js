'use strict';

var path = require('path');

var jsonfile = require('jsonfile');

var fecom = require('../fecom');

module.exports = function (config) {
  var packageJson = path.join(fecom.root, 'package.json');
  var packageCfg = {};

  packageCfg = jsonfile.readFileSync(packageJson);
  packageCfg.name = config.name;
  packageCfg.description = config.description;
  packageCfg.author = config.author;
  jsonfile.writeFileSync(packageJson, packageCfg, { spaces: 2 });
};