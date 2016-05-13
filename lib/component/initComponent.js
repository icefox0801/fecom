'use strict';

var path = require('path');
var fs = require('graceful-fs');
var fse = require('fs-extra');
var jsonfile = require('jsonfile');

module.exports = function (config, options) {
  var cwd = path.resolve(options.cwd);
  var componentJson = path.join(options.cwd, 'component.json');
  var readme = path.join(options.cwd, 'README.md');
  var content = '# ' + config.name + '\n' + config.description + '\n';

  config.dependencies = [];
  config.devDependencies = [];
  config.exclude = ['docs', 'examples', 'test', 'README.md'];

  jsonfile.writeFileSync(componentJson, config, { spaces: 2});
  fs.writeFileSync(readme, content);
  fse.copySync(path.resolve('../../templates/default'), cwd);
};