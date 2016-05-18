'use strict';

var path = require('path');

var _ = require('lodash');
var Promise = require('bluebird');

var fecom = require('./fecom');
var getProfile = require('./profile/getProfile');
var getConfig = require('./component/getConfig');

module.exports = function (env, userProfile, userConfig) {

  fecom.root = env.cwd;

  Promise
    .try(function () {
      return Promise
        .all([
          userProfile ? fecom.async(userProfile) : getProfile(),
          userConfig ? fecom.async(userConfig) : getConfig({ cwd: env.cwd })
        ]);
    })
    .then(function (results) {
      var profile = results[0];
      var config = results[1];
      fecom.initialize(env.cwd, config, profile);
    })
    .catch(fecom.errorHandler);

};