'use strict';

var path = require('path');
var fs = require('graceful-fs');
var inquirer = require('inquirer');
var ini = require('ini');

var logger = require('../util/logger');
var questions = require('./questions');

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

module.exports = function () {
  var profileFile = path.join(getUserHome(), '.fecomrc');
  logger.info('User profile not found, initializing "~/.fecomrc"');
  return inquirer.prompt(questions)
    .then(function (answers) {
      fs.writeFileSync(profileFile, ini.stringify(answers));
      return answers;
    });
};