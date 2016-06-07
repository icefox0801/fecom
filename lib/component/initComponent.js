'use strict';

var path = require('path');
var fs = require('graceful-fs');
var fse = require('fs-extra');
var jsonfile = require('jsonfile');

var fecom = require('../fecom');

module.exports = function (config) {
  var cwd = path.resolve(fecom.root);
  var componentJson = path.join(fecom.root, 'component.json');
  var readme = path.join(fecom.root, 'README.md');
  var content = '# ' + config.name + '\n' + config.description + '\n';

  config.dependencies = [];
  config.devDependencies = [];
  config.exclude = ['docs', 'examples', 'test', 'README.md'];

  jsonfile.writeFileSync(componentJson, config, { spaces: 2 });
  fs.writeFileSync(readme, content);
  fse.copySync(path.join(__dirname, '../../templates/default'), cwd);
  return fecom.async(config);
};