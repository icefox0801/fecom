'use strict';

var Promise = require('bluebird');

var fecom = require('./fecom');
var getConfig = require('./component/getConfig');
var gitlabRepo = require('./remote/gitlab');

module.exports = function (options) {
  getConfig(options)
    .then(function (config) {
      var toInstall = config.dependencies;
      return gitlabRepo.validate('icefox0801', 'widgets');
    })
    .then(function () {
      console.log(arguments);
    })
    .catch(function (err) {
      fecom.logger.error(err.message);

      if ('debug' === process.env.NODE_ENV) {
        fecom.logger.error(err.stack);
      }

    });
};