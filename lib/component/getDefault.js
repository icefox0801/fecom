'use strict';

var path = require('path');

var getProfile = require('../profile/getProfile');

module.exports = function (options) {
  var defaults = {};

  defaults.name = path.basename(options.cwd);
  defaults.version = '1.0.0';

  return getProfile()
    .then(function (profile) {
      defaults.username = profile.username;
      defaults.email = profile.email;
      defaults.token = profile.token;
      return defaults;
    });

};