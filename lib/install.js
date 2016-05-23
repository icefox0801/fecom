'use strict';

var fs = require('graceful-fs');

var _ = require('lodash');
var Promise = require('bluebird');
var treeify = require('treeify');

var fecom = require('./fecom');
var Component = require('./component/Component');
var getInstalled = require('./component/getInstalled');
var getToInstall = require('./component/getToInstall');
var analyze = require('./component/analyze');

module.exports = function (list, options) {
  var parsedList = list.map(function (str) {
    return fecom.parse(str);
  });
  return Promise
    .props({
      installed: getInstalled(),
      toInstall: getToInstall(parsedList)
    })
    .then(function (results) {
      return analyze(results.toInstall, results.installed);
    })
    .then(function (treeModel) {

      var toInstallAll = treeModel.getAllNodes().slice(0).map(function (parsed) {
        return new Component(parsed, 'remote');
      });

      return Promise.reduce(toInstallAll, function (newInstalledList, component) {
        return component.install()
          .then(function (newInstalled) {
            newInstalledList.push(newInstalled);
            return newInstalledList;
          })
          .catch(function () {
            var _err = new Error(fecom.i18n('FAIL_TO_INSTALL_COMPONENTS', component.stringify()));
            fecom.errorHandler(_err);
            return newInstalledList;
          });
      }, []);

    })
    .then(function (newInstalled) {
      var map = {};
      var rootName = fecom.config.name;
      var rootVersion = fecom.config.version;
      var tree, str;

      fecom.logger.info(fecom.i18n('FINISH_INSTALLING_COMPONENT'));

      if (!newInstalled.length) {
        fecom.logger.info(fecom.i18n('NO_COMPONENT_INSTALLED'));
        return false;
      }

      map = _.zipObject(newInstalled.map(function (component) {
        return component.stringify();
      }));

      tree = treeify.asTree(map);
      str = rootName ? (rootName + (rootVersion ? '@' + rootVersion : '') + '\n') : '';

      fecom.logger.info('Installed: \n' + str + tree);
    })
    .catch(fecom.errorHandler);

};