'use strict';

var _ = require('lodash');
var Spinner = require('cli-spinner').Spinner;

var fecom = require('../fecom');
var Tree = require('../component/Tree');
var treeify = require('treeify');

var interceptors = function (strategy, arg) {
  var strategies = {
    'installed': function (node) {

      var installed = arg.map(function (component) {
        return {
          name: component.name,
          owner: component.owner,
          version: component.version
        };
      });

      var matched = _(installed).find(node);

      if (!!matched) {
        fecom.logger.info(fecom.i18n('COMPONENT_ALREADY_INSTALLED', fecom.stringify(matched)));
      }

      return !matched;
    }
  };
  return (function () {
    return strategies[strategy];
  }());
};

module.exports = function (toInstall, installed, strategy) {
  fecom.logger.info(fecom.i18n('BEGIN_TO_ANALYZE_DEPENDENCIES'));

  var spinner = new Spinner(fecom.i18n('ANALYZING'));
  var interceptor;
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  strategy = strategy || 'installed';
  interceptor = interceptors(strategy, installed);
  // var handleNode = null;
  return Promise
    .all(toInstall.map(function (component) {
      return component.getDependencies(interceptor);
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
      return {};
    });
};