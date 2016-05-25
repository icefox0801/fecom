'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var jsonfile = require('jsonfile');
var Promise = require('bluebird');
var treeify = require('treeify');
var inquirer = require('inquirer');

var fecom = require('./fecom');
var Component = require('./component/Component');
var getInstalled = require('./component/getInstalled');
var getToInstall = require('./component/getToInstall');
var analyze = require('./component/analyze');
var mergeDependencies = require('./component/mergeDependencies');

module.exports = function (semList, options) {
  var installed, toInstall;

  var parsedList = semList.map(function (str) {
    return fecom.parse(str);
  });
  return Promise
    .props({
      installed: getInstalled(),
      toInstall: getToInstall(parsedList)
    })
    .then(function (results) {
      installed = results.installed;
      toInstall = results.toInstall;
      return analyze(results.toInstall, results.installed, 'ask');
    })
    .then(function (treeModel) {
      debugger;
      var toInstallAll = treeModel.getAllNodes().slice(1).filter(function (parsed) {
        return !parsed.isInstalled;
      }).map(function (parsed) {
        return new Component(parsed, 'remote');
      });

      if (toInstallAll.length) {
        fecom.logger.info(fecom.i18n('BEGIN_TO_DOWNLOAD_COMPONENTS'));
      }

      return Promise.reduce(toInstallAll, function (newInstalledList, component) {
        return component.install()
          .then(function (newInstalled) {
            newInstalledList.push(newInstalled);
            return newInstalledList;
          })
          .catch(function (err) {
            var _err = new Error(fecom.i18n('FAIL_TO_INSTALL_COMPONENTS', component.stringify()));
            fecom.errorHandler(err);
            return newInstalledList;
          });
      }, []);

    })
    .then(function (newInstalledList) {
      var map = {};
      var rootName = fecom.config.name;
      var rootVersion = fecom.config.version;
      var tree, str;

      // fecom.logger.info(fecom.i18n('FINISH_INSTALLING_COMPONENT'));

      if (!newInstalledList.length) {
        fecom.logger.info(fecom.i18n('NO_COMPONENT_TO_INSTALL'));
        return newInstalledList;
      }

      map = _.zipObject(newInstalledList.map(function (component) {
        return component.stringify();
      }));

      tree = treeify.asTree(map);
      str = rootName ? (rootName + (rootVersion ? '@' + rootVersion : '') + '\n') : '';

      fecom.logger.info(fecom.i18n('INSTALLED_COMPONENTS', str + tree));

      return newInstalledList;
    })
    .then(function (newInstalledList) {
      var oldDependencies = fecom.config.dependencies;
      var oldParsedList = oldDependencies.map(function (semantic) {
        return fecom.parse(semantic);
      });

      newInstalledList = newInstalledList.filter(function (component) {
        return component.specified  || component.resolved;
      });

      var newParsedList = newInstalledList.map(function (parsed) {
        return _.pick(parsed, ['name', 'owner', 'version', 'resolved', 'specified']);
      });

      return mergeDependencies(newParsedList, oldParsedList);
    })
    .then(function (dependencies) {
      var componentJson = path.join(options.cwd, 'component.json');
      var json = {};

      if (fs.existsSync(componentJson)) {
        json = jsonfile.readFileSync(componentJson);
      }

      json.dependencies = dependencies.map(function (parsed) {
        return fecom.stringify(parsed);
      }).sort();

      jsonfile.writeFileSync(componentJson, json, { spaces: 2 });
    })
    .catch(fecom.errorHandler);

};