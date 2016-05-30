'use strict';

var path = require('path');
var url = require('url');

var _ = require('lodash');
var fs = require('graceful-fs');
var treeify = require('treeify');
var ini = require('ini');
var Promise = require('bluebird');

var fecom = require('./fecom');

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

module.exports = function (query, options) {
  var profile = fecom.profile;

  return Promise
    .try(function () {

      if (query) {
        // Print user profile
        var obj = url.parse('?' + query, true);
        var profileFile = path.join(getUserHome(), '.fecomrc');
        var queryObj = _.pick(obj.query, ['username', 'email', 'token']);
        profile = _.assign({}, profile, queryObj);
        fs.writeFileSync(profileFile, ini.stringify(profile));
      }

      return profile;
    })
    .then(function (profile) {
      var profileList = treeify.asTree(profile, true);
      fecom.logger.info(fecom.i18n('USER_PROFILE', profileList));
    })
    .catch(fecom.errorHandler);

};