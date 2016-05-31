'use strict';

var _ = require('lodash');
var inquirer = require('inquirer');

var fecom = require('../fecom');
var Component = require('./Component');

function buildConflictList(treeModel, installed) {
  var nodes = treeModel.walk('DFS');
  var toInstallAll = _.tail(nodes)
    .filter(function (node) {
      return !node.isInstalled;
    }).map(function (node) {
      return new Component(node, 'remote');
    });
  var allComponents = toInstallAll.concat(installed);
  // Check if components with same name belong to different owners
  var componentList = _(allComponents)
    .groupBy('name')
    .value();
  var conflictList = [];
  var conflictStr = '';

  _.invokeMap(componentList, function () {
    var components = _(this).uniqBy('owner').value();

    if (components.length > 1) {
      conflictList.push({
        name: components[0].name,
        owners: components.map(function (component) {
          return component.owner;
        })
      });
    }
  });

  if (conflictList.length > 0) {
    var err = new Error(fecom.i18n('COMPONENT_OWNERS_CONFLICT'));
    err.conflictList = conflictList;
    throw err;
  }

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

module.exports = function resolveConflict(treeModel, installed) {
  var conflictList = buildConflictList(treeModel, installed);
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
        name: component.version + ' ($0)'.replace('$0', fecom.i18n((component.type === 'local' ? 'INSTALLED' : 'TO_INSTALL'))),
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
    fecom.logger.info(fecom.i18n('COMPONENT_VERSION_CONFLICT', conflicted));
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
        return resolveConflict(treeModel, installed);
      })
      .then(function () {
        return treeModel;
      });
  }

  return treeModel;
};