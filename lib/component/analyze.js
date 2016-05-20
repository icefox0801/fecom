'use strict';

var Spinner = require('cli-spinner').Spinner;

var fecom = require('../fecom');
var Tree = require('../component/Tree');
var treeify = require('treeify');

module.exports = function (toInstall, installed, strategy) {
  fecom.logger.info(fecom.i18n('BEGIN_TO_ANALYZE_DEPENDENCIES'));

  var spinner = new Spinner(fecom.i18n('ANALYZING'));
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
      var model = {};
      var treeModel, treeMap;
      model.props = {
        name: fecom.config.name,
        owner: fecom.profile.username,
        version: fecom.config.version
      };

      model.subNodes = subTrees;
      treeModel = new Tree(model);
      treeMap = treeify.asTree(treeModel.transform());
      fecom.logger.info(fecom.i18n('DEPENDENCIES_TREE') + '\n' + treeMap);
      fecom.logger.info(fecom.i18n('FINISH_ANALYZING_DEPENDENCIES'));
      return treeModel;
    })
    .catch(function (err) {
      spinner.stop();
      process.stdout.write('\n');
      fecom.errorHandler(err);
    });
};