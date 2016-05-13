'use strict';

var path = require('path');

var jsonfile = require('jsonfile');

module.exports = function (config, options) {
  var packageJson = path.join(options.cwd, 'package.json');
  var packageCfg = {};

  packageCfg = jsonfile.readFileSync(packageJson);
  packageCfg.name = config.name;
  packageCfg.description = config.description;
  packageCfg.author = config.author;
  jsonfile.writeFileSync(packageJson, packageCfg, { spaces: 2 });
};