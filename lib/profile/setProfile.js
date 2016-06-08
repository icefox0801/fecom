'use strict';

var path = require('path');
var fs = require('graceful-fs');
var _ = require('lodash');
var ini = require('ini');
var inquirer = require('inquirer');

var logger = require('../util/logger');
var questions = require('./questions');
var initProfile = require('./initProfile');

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

module.exports = function (key, value) {
  var toBeAsked = _.find(questions, { name: key });
  var profileFile = path.join(getUserHome(), '.fecomrc');
  var profile = {};

  if (!key) {
    throw new Error('Must specify a key param');
  }

  if (!fs.existsSync(profileFile)) {
    return initProfile();
  }

  profile = ini.parse(fs.readFileSync(profileFile, 'utf-8'));

  if (!value) {
    return inquirer.prompt([toBeAsked])
      .then(function (answers) {
        profile[key] = answers[key];
        fs.writeFileSync(profileFile, ini.stringify(profile));
      });
  }

};