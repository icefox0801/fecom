'use strict';

var _ = require('lodash');
var semver = require('semver');
var Spinner = require('cli-spinner').Spinner;

var fecom = require('../fecom');
var Component = require('./Component');
var Tree = require('./Tree');
var walkable = Tree.walkable;
var treeify = require('treeify');

var interceptors = function (strategy, arg) {
  var strategies = {
    'before': function (tree) {
      var node = tree.props;

      var installed = arg.map(function (component) {
        return {
          name: component.name,
          owner: component.owner,
          version: component.version
        };
      });

      var matched = _(installed).find(_.omit(node, ['version']));

      if (!!matched) {

        if (matched.version === node.version) {
          node.isInstalled = true;
          node.status = 'installed';
          tree[walkable.childrenName] = [];
        } else {
          node.conflict = true;
          node.status = semver.gt(node.version, matched.version) ? ('↑' + node.version).yellow : ('↓' + node.version).red;
        }

      }

      return !matched;
    }
  };
  return (function () {
    return strategies[strategy];
  }());
};

module.exports = function (toInstall, installed, strategy) {
  // fecom.logger.info(fecom.i18n('BEGIN_TO_ANALYZE_DEPENDENCIES'));
  var interceptor;
  var root = {
    name: fecom.config.name,
    owner: fecom.profile.username,
    version: fecom.config.version
  };
  var children = toInstall.map(function (component) {
    return {
      props: {
        name: component.name,
        owner: component.owner,
        version: component.version
      }
    };
  });
  var rootComponent = new Component(root, 'remote', {
    children: children
  });
  var spinner = new Spinner(fecom.i18n('ANALYZING_DEPENDENCIES'));

  spinner.setSpinnerString('|/-\\');
  spinner.start();
  strategy = strategy || 'before';
  interceptor = interceptors(strategy, installed);
  // var handleNode = null;
  return rootComponent.getDependencies(interceptor)
    .then(function (filledTree) {
      spinner.stop(true);
      var treeModel = new Tree(filledTree);
      var treeMap = treeify.asTree(treeModel.transform());
      var nodes = treeModel.walk('DFS');

      nodes.forEach(function (parsed) {
        if (parsed.isInstalled) {
          fecom.logger.info(fecom.i18n('COMPONENT_ALREADY_INSTALLED', fecom.stringify(_.omit(parsed, ['status']))));
        } else if (parsed.conflict) {
          fecom.logger.info(fecom.i18n('COMPONENT_VERSION_CONFLICT', fecom.stringify(_.omit(parsed, ['status']))));
        }
      });

      fecom.logger.info(fecom.i18n('DEPENDENCIES_TREE') + '\n' + treeMap);
      // fecom.logger.info(fecom.i18n('FINISH_ANALYZING_DEPENDENCIES'));
      return treeModel;
    })
    .catch(function (err) {
      spinner.stop(true);
      fecom.errorHandler(err);
      return {};
    });
};