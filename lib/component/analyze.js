'use strict';

var Spinner = require('cli-spinner').Spinner;

var fecom = require('../fecom');

module.exports = function (toInstall, installed, strategy) {
  fecom.logger.info('Begin to analyze dependencies');

  var spinner = new Spinner('Analyzing...');
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  strategy = strategy || 'after';
  // var handleNode = null;
  return Promise
    .all(toInstall.map(function (component) {
      return component.getDependencies();
    }))
    .then(function (subTrees) {
      spinner.stop();
      process.stdout.write('\n');
      var tree = [];
      tree.push({
        name: fecom.config.name,
        owner: fecom.profile.username,
        version: fecom.config.version
      });

      tree.push(subTrees);
      fecom.logger.info('Finish analyzing dependencies');
      return tree;
    })
    .catch(function (err) {
      spinner.stop();
      process.stdout.write('\n');
      fecom.errorHandler(err);
    });
};