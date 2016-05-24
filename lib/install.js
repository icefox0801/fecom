'use strict';

var fs = require('graceful-fs');

var _ = require('lodash');
var Promise = require('bluebird');
var treeify = require('treeify');
var inquirer = require('inquirer');

var fecom = require('./fecom');
var Component = require('./component/Component');
var getInstalled = require('./component/getInstalled');
var getToInstall = require('./component/getToInstall');
var analyze = require('./component/analyze');

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
      return analyze(results.toInstall, results.installed, 'before');
    })
    .then(function (treeModel) {
      var toInstallAll = treeModel.getAllNodes().slice(1).filter(function (parsed) {
        return !parsed.isInstalled;
      }).map(function (parsed) {
        return new Component(parsed, 'remote');
      });

      return Promise
        .reduce(toInstallAll, function (toInstallResolved, component, index) {
          fecom.logger.info('Version conflict');
          var installedVersion = _(installed).find(_.pick(component, ['name', 'owner'])).version;
          var toInstallVersion = component.version;
          var choices = [
            {
              name: installedVersion + ' (installed)',
              value: installedVersion
            },
            {
              name: toInstallVersion + ' (to install)',
              value: toInstallVersion
            }
          ];
          var questions = [{
            name: 'version',
            message: 'Please choose a version: ',
            type: 'list',
            choices: choices
          }];

          if (!component.conflict) {
            return toInstallResolved;
          }

          return inquirer.prompt(questions)
            .then(function (answers) {
              if (answers.version === installedVersion) {
                _.pullAt(toInstallResolved, index);
              }

              return toInstallResolved;
            });
        }, toInstallAll);
    })
    .then(function (toInstallResolved) {

      if (toInstallResolved.length) {
        fecom.logger.info(fecom.i18n('BEGIN_TO_DOWNLOAD_COMPONENTS'));
      }

      return Promise.reduce(toInstallResolved, function (newInstalledList, component) {
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
        fecom.logger.info(fecom.i18n('NO_COMPONENT_INSTALLED'));
        return false;
      }

      map = _.zipObject(newInstalledList.map(function (component) {
        return component.stringify();
      }));

      tree = treeify.asTree(map);
      str = rootName ? (rootName + (rootVersion ? '@' + rootVersion : '') + '\n') : '';

      fecom.logger.info(fecom.i18n('INSTALLED_COMPONENTS', str + tree));
    })
    .catch(fecom.errorHandler);

};