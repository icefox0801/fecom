'use strict';

var path = require('path');
var fs = require('graceful-fs');
var jsonfile = require('jsonfile');

module.export = function (env, callback) {
  var componentJson = path.join(env.cwd, 'component.json');
  var json = {};

  if ('function' !== typeof callback) {
    throw new Error('Callback is expected to be function');
  }

  if (fs.existsSync(componentJson)) {
    json = jsonfile.readFileSync(componentJson);
  }

  return callback(null, json);
};