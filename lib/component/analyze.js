'use strict';

var _ = require('lodash');
var semver = require('semver');
var inquirer = require('inquirer');
var treeify = require('treeify');
var Spinner = require('cli-spinner').Spinner;

var fecom = require('../fecom');
var Component = require('./Component');
var Tree = require('./Tree');
var resolveConflict = require('./resolveConflict');
var walkable = Tree.walkable;

var interceptors = function (strategy, installed, toInstall) {
  var strategies = {
    'latest': function (tree) {
      var node = tree.props;
      installed = installed.map(function (component) {
        return {
          name: component.name,
          owner: component.owner,
          version: component.version,
          specified: component.specified
        };
      });

      var matched = _(installed).find(_.omit(node, ['version']));
      var toMatch = _(toInstall).find(_.omit(node, ['version']));
      // Save specified component version
      if (toMatch && node.hasOwnProperty('specified') && node.specified) {
        toMatch.version = node.version;
      }
      // If component is same with specified to install
      if (toMatch && !(node.hasOwnProperty('specified') && node.specified)) {
        node.merged = true;
        node.status = fecom.i18n('MERGED_STATUS', toMatch.version);
        tree[walkable.childrenName] = [];
        return false;
      }
      // No match in installed component(s)
      if (!matched) {
        return true;
      }
      // Component to install is specified
      if (node.specified) {

        // Matched installed component has the same version with component to install
        if (matched.version === node.version) {
          node.installed = true;
          node.status = fecom.i18n('INSTALLED_STATUS');
          tree[walkable.childrenName] = [];
          return false;
        }

        return true;
      }
      // Matched installed component is specified
      if (matched.specified) {
        node.installed = true;
        node.status = fecom.i18n('INSTALLED_STATUS');
        tree[walkable.childrenName] = [];
        return false;
      }
      // Matched installed component has the same version with component to install
      if (matched.version === node.version) {
        node.installed = true;
        node.status = fecom.i18n('INSTALLED_STATUS');
        tree[walkable.childrenName] = [];
        return false;
      }
      // If matched installed component version is greater than component to install
      if (semver.gt(matched.version, node.version)) {
        node.installed = true;
        node.status = fecom.i18n('INSTALLED_STATUS');
        tree[walkable.childrenName] = [];
        return false;
      }
      //node.conflict = true;
      //node.status = semver.gt(node.version, matched.version) ? ('↑' + node.version).yellow : ('↓' + node.version).red;
      return true;
    },
    'ask': function (tree) {
      var node = tree.props;
      installed = installed.map(function (component) {
        return {
          name: component.name,
          owner: component.owner,
          version: component.version,
          specified: component.specified
        };
      });
      var matched = _(installed).find(_.omit(node, ['specified']));
      var toMatch = _(toInstall).find(_.omit(node, ['version']));

      if (toMatch) {
        node.specified = true;
      }
      // Matched installed
      if (matched) {
        node.installed = true;
        node.status = fecom.i18n('INSTALLED_STATUS');
        tree[walkable.childrenName] = [];
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
  var children = toInstall.map(function (component) {
    return {
      props: {
        name: component.name,
        owner: component.owner,
        version: component.version,
        specified: component.specified
      }
    };
  });
  var rootComponent = new Component(null, 'root', {
    children: children
  });
  var spinner = new Spinner(fecom.i18n('ANALYZING_DEPENDENCIES'));

  spinner.setSpinnerString('|/-\\');
  spinner.start();
  strategy = strategy || 'ask';
  interceptor = interceptors(strategy, installed, toInstall);
  // var handleNode = null;
  return rootComponent.getRemoteDependenciesTree(interceptor)
    .then(function (filledTree) {
      spinner.stop(true);
      var treeModel = new Tree(filledTree);
      var treeMap = treeify.asTree(treeModel.transform());
      var nodes = treeModel.walk('DFS');

      nodes.forEach(function (parsed) {
        if (parsed.installed) {
          fecom.logger.info(fecom.i18n('COMPONENT_ALREADY_INSTALLED', fecom.stringify(_.omit(parsed, ['status']))));
        } else if (parsed.conflict) {
          fecom.logger.info(fecom.i18n('COMPONENT_VERSION_CONFLICT', fecom.stringify(_.omit(parsed, ['status']))));
        }
      });

      fecom.logger.info(fecom.i18n('DEPENDENCIES_TREE') + '\n' + treeMap);
      // fecom.logger.info(fecom.i18n('FINISH_ANALYZING_DEPENDENCIES'));
      return treeModel;
    })
    .then(function (treeModel) {
      return resolveConflict(treeModel, installed, strategy);
    })
    .catch(function (err) {
      spinner.stop(true);
      throw err;
    });
};