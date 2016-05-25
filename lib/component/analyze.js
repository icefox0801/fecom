'use strict';

var _ = require('lodash');
var semver = require('semver');
var inquirer = require('inquirer');
var Spinner = require('cli-spinner').Spinner;

var fecom = require('../fecom');
var Component = require('./Component');
var Tree = require('./Tree');
var walkable = Tree.walkable;
var treeify = require('treeify');

var interceptors = function (strategy, arg) {
  var strategies = {
    'latest': function (tree) {
      var node = tree.props;
      var installed = arg.map(function (component) {
        return {
          name: component.name,
          owner: component.owner,
          version: component.version
        };
      });

      var matched = _(installed).find(_.omit(node, ['version']));
      // No match in installed component(s)
      if (!matched) {
        return true;
      }
      // Component to installed is specified
      if (node.specified) {
        return true;
      }
      // Matched installed component is specified
      if (matched.specified) {
        node.isInstalled = true;
        node.status = 'installed';
        tree[walkable.childrenName] = [];
        return false;
      }
      // Matched installed component has the same version with component to install
      if (matched.version === node.version) {
        node.isInstalled = true;
        node.status = 'installed';
        tree[walkable.childrenName] = [];
        return false;
      }
      // If matched installed component version is greater than component to install
      if (semver.gt(matched.version, node.version)) {
        node.isInstalled = true;
        node.status = 'installed';
        tree[walkable.childrenName] = [];
        return false;
      }
      //node.conflict = true;
      //node.status = semver.gt(node.version, matched.version) ? ('↑' + node.version).yellow : ('↓' + node.version).red;
      return true;
    },
    'ask': function (tree) {
      var node = tree.props;
      var installed = arg.map(function (component) {
        return {
          name: component.name,
          owner: component.owner,
          version: component.version
        };
      });
      var matched = _(installed).find(_.omit(node, ['version']));
      // Matched installed
      if (matched) {
        node.isInstalled = true;
        node.status = 'installed';
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
        version: component.version,
        specified: true
      }
    };
  });
  var rootComponent = new Component(root, 'remote', {
    children: children
  });
  var spinner = new Spinner(fecom.i18n('ANALYZING_DEPENDENCIES'));

  spinner.setSpinnerString('|/-\\');
  spinner.start();
  strategy = strategy || 'ask';
  interceptor = interceptors(strategy, installed);
  // var handleNode = null;
  return rootComponent.getRemoteDependencies(interceptor)
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
    .then(function (treeModel) {
      function buildConflictList() {
        var nodes = treeModel.walk('DFS');
        var toInstallAll = _.tail(nodes)
          .filter(function (node) {
            return !node.isInstalled;
          }).map(function (node) {
            return new Component(node, 'remote');
          });
        var allComponents = toInstallAll.concat(installed);
        return _(allComponents)
          .groupBy(function (node) {
            return node.owner + '/' + node.name;
          })
          .mapValues(function (list) {

            if (list.some(function (component) {
                return component.resolved;
              })) {
              return list.filter(function (component) {
                return component.resolved;
              }).slice(0, 1);
            }

            return list;
          })
          .value();
      }

      function resolveConflict() {
        var conflictList = buildConflictList();
        var conflicted = '';
        var conflicts = [];
        var questions = [];
        var choices = [];

        _.forIn(conflictList, function (components, semantic) {

          if (1 === components.length) {
            return true;
          }

          conflicted = semantic;
          conflicts = components;
          choices = components.map(function (component) {
            return {
              name: component.version + (component.isInstalled ? ' (installed)' : ' (to install)'),
              value: component.version
            };
          });
          choices = _.uniqBy(choices, 'value');
          return false;
        });

        if (choices.length) {
          questions = {
            name: 'version',
            message: 'Please choose a version: ',
            type: 'list',
            choices: choices
          };
          fecom.logger.info('Conflicted: ' + conflicted);
          return inquirer.prompt(questions)
            .then(function (answers) {
              var parsed = fecom.parse(conflicted);
              parsed.version = answers.version;
              var toResolve = _.filter(conflicts, parsed).slice(0, 1);
              var toRemove = _.reject(conflicts, parsed);
              var toResolvePaths = [];
              var toRemovePaths = [];
              toResolvePaths = toResolve.reduce(function (paths, component) {
                paths = paths.concat(treeModel.getPathByNode(_.pick(component, ['name', 'owner', 'version'])));
                return paths;
              }, toResolvePaths);
              toRemovePaths = toRemove.reduce(function (paths, component) {
                paths = paths.concat(treeModel.getPathByNode(_.pick(component, ['name', 'owner', 'version'])));
                return paths;
              }, toRemovePaths);
              toResolvePaths.forEach(function (path) {
                treeModel.updateTreeByPath(path, { resolved: true });
              });
              toRemovePaths.forEach(function (path) {
                treeModel.removeTreeByPath(path);
              });
              return resolveConflict();
            })
            .then(function () {
              return treeModel;
            });
        }

        return treeModel;
      }

      return resolveConflict();
    })
    .catch(function (err) {
      spinner.stop(true);
      fecom.errorHandler(err);
      return {};
    });
};