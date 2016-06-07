'use strict';

var path = require('path');

var fecom = require('../fecom');

module.exports = function (options) {
  var defaults = {};

  defaults.name = path.basename(fecom.root);
  defaults.version = '1.0.0';
  defaults.username = fecom.profile.username;
  defaults.email = fecom.profile.email;
  defaults.token = fecom.profile.token;

  return fecom.async(defaults);
};