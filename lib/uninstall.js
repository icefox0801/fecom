'use strict';

var _ = require('lodash');
var treeify = require('treeify');
var Promise = require('bluebird');

var fecom = require('./fecom');
var Component = require('./component/Component');
var Tree = require('./component/Tree');
var updateComponentJson = require('./component/updateComponentJson');

module.exports = function (semList, options) {
  var rootComponent = new Component(null, 'root');
  return rootComponent.getLocalDependenciesTree()
    .then(function (filledTree) {
      var parsedList = semList.map(function (semantic) {
        return fecom.parse(semantic);
      });

      if (!options.force) {
        // Component trees can only be removed from root(components must be specified in component.json)
        // After component trees were removed, three can't be a same node with the tree removed
        var treeModel = new Tree(filledTree);
        var specifiedList = treeModel.getAllNodes('DFS').filter(function (node) {
          return node.specified;
        });
        var componentList = treeModel.getAllNodes('DFS').slice(1);
        // Filter out component not installed
        parsedList = parsedList.filter(function (parsed) {
          var matched = _(componentList).find(_(parsed).omit('version').value());
          var semantic = fecom.stringify(_(parsed).omit('version').value());

          if (!matched) {
            fecom.logger.info(fecom.i18n('COMPONENT_NOT_INSTALLED', semantic));
          }

          return matched;
        });

        var results = _(parsedList).partition(function (parsed) {
          return ~_(specifiedList).findIndex(_(parsed).omit('version').value());
        }).value();

        var specifiedUninstalled = results[0];
        parsedList = results[1];
        var children = specifiedUninstalled.map(function (parsed) {
          parsed.installed = true;
          parsed.specified = true;
          return {
            props: parsed
          };
        });

        var specifiedComponent = new Component(null, 'root', {
          children: children
        });

        var promise = children.length ? specifiedComponent.getLocalDependenciesTree() : fecom.async(specifiedComponent.tree);

        return promise
          .then(function (filledUninstallTree) {
            // FillerUninstallTree is a tree built on specified components to be uninstalled
            var uninstallTreeModel = new Tree(filledUninstallTree);
            var toUninstallAll = uninstallTreeModel.getAllNodes('BFS').slice(1);

            var dependenciesNodes = uninstallTreeModel.getAllNodes('DFS').slice(1).filter(function (node) {
              return !node.specified;
            });

            parsedList = _(parsedList).reject(function (parsed) {
              return ~_(dependenciesNodes).findIndex(_(parsed).omit('version').value());
            }).value();

            if (parsedList.length) {
              // Component to be uninstalled is a dependency of other component
              parsedList.forEach(function (parsed) {
                var semantic = fecom.stringify(_(parsed).omit(['version']).value());
                fecom.logger.info(fecom.i18n('OTHER_COMPONENT_DEPEND', semantic));
              });
              throw new Error(fecom.i18n('UNABLE_TO_UNINSTALL'));
            }
            // Check if there were same components in the rest tree after uninstalling specified components
            specifiedUninstalled.forEach(function (parsed) {
              var paths = treeModel.findPathByNode(parsed);

              if (paths.length) {
                treeModel.removeTreeByPath(paths[0]);
              }

            });

            var restTree = new Tree(treeModel.model);
            var restNodes = restTree.getAllNodes('DFS').slice(1);
            var restList = toUninstallAll.filter(function (parsed) {
              var matched = _(restNodes).find(_(parsed).pick(['name', 'owner']).value());

              if (matched) {
                fecom.logger.info(fecom.i18n('OTHER_COMPONENT_DEPEND', parsed.owner + '/' + parsed.name));
              }

              return matched;
            });

            if (restList.length) {
              throw new Error(fecom.i18n('UNABLE_TO_UNINSTALL'));
            }

            return _(toUninstallAll).uniqBy('name').value()
              .map(function (parsed) {
                return new Component(parsed, 'local');
              });
          });
      }
    })
    .then(function (toUninstallAll) {
      return Promise.reduce(toUninstallAll, function (uninstalledList, component) {
        return component.uninstall()
          .then(function (uninstalled) {
            uninstalledList.push(uninstalled);
            return uninstalledList;
          });
      }, []);
    })
    .then(function (uninstalledList) {
      var map = {};
      var rootName = fecom.config.name;
      var rootVersion = fecom.config.version;
      var tree, str;

      if (!uninstalledList.length) {
        fecom.logger.info(fecom.i18n('NO_COMPONENT_TO_UNINSTALL'));
        return uninstalledList;
      }

      map = _.zipObject(uninstalledList.map(function (component) {
        return component.stringify();
      }));

      tree = treeify.asTree(map);
      str = rootName ? (rootName + (rootVersion ? '@' + rootVersion : '') + '\n') : '';

      fecom.logger.info(fecom.i18n('UNINSTALLED_COMPONENTS', str + tree));

      return uninstalledList;
    })
    .then(function (uninstalledList) {
      return updateComponentJson(uninstalledList, true);
    })
    .catch(fecom.errorHandler);

};