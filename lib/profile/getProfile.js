'use strict';

var path = require('path');
var fs = require('graceful-fs');
var ini = require('ini');
var inquirer = require('inquirer');

var promisify = require('../util/promisify');
var setProfile = require('./setProfile');
var initProfile = require('./initProfile');

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

module.exports = function (key) {
  var profileFile = path.join(getUserHome(), '.fecomrc');
  var profile = {};
  // ~/.fecomrc not exists
  if (!fs.existsSync(profileFile)) {
    return initProfile();
  }

  profile = ini.parse(fs.readFileSync(profileFile, 'utf-8'));
  // ~/.fecomrc exists but key not found
  if (key && !profile.hasOwnProperty(key)) {
    return setProfile(key);
  }

  return promisify(profile);
};