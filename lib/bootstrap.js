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
        .all([getProfile(), getConfig({ cwd: env.cwd })]);
    })
    .then(function (results) {
      var profile = _.assign({}, results[0], userProfile);
      var config = _.assign({}, results[1], userConfig);
      fecom.initialize(env.cwd, config, profile);
    })
    .catch(fecom.errorHandler);

};