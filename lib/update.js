'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var Promise = require('bluebird');
var jsonfile = require('jsonfile');
var treeify = require('treeify');
var Spinner = require('cli-spinner').Spinner;

var fecom = require('./fecom');
var getInstalled = require('./component/getInstalled');
var updateComponentJson = require('./component/updateComponentJson');

var spinner = new Spinner(fecom.i18n('CHECKING_UPDATE'));

module.exports = function (semList) {
  return getInstalled()
    .then(function (installed) {
      var parsedList = semList.map(function (semantic) {
        return fecom.parse(semantic);
      });

      if (parsedList.length) {
        installed = installed.filter(function (component) {
          return ~_(parsedList).findIndex({ name: component.name });
        });
      }

      return installed;
    })
    .then(function (installed) {
      spinner.setSpinnerString('|/-\\');
      spinner.start();
      return Promise.all(installed.map(function (component) {
        return component.checkUpdate();
      }));
    })
    .then(function (installed) {
      var map = {};
      var rootName = fecom.config.name;
      var rootVersion = fecom.config.version;
      var tree, str;

      spinner.stop(true);
      map = _.zipObject(installed.map(function (component) {
        return component.stringify();
      }));

      tree = treeify.asTree(map);

      str = rootName ? (rootName + (rootVersion ? '@' + rootVersion : '') + '\n') : '';

      fecom.logger.info(fecom.i18n('COMPONENT_VERSIONS', str + tree));
      return installed.filter(function (component) {
        return component.hasUpdate;
      }).map(function (component) {
        component.type = 'remote';
        return component;
      });
    })
    .then(function (toInstall) {
      if (toInstall.length) {
        fecom.logger.info(fecom.i18n('BEGIN_TO_DOWNLOAD_COMPONENTS'));
      }

      return Promise.reduce(toInstall, function (newInstalledList, component) {
        return component.install()
          .then(function (newInstalled) {
            newInstalledList.push(newInstalled);
            return newInstalledList;
          })
          .catch(function (err) {
            // var _err = new Error(fecom.i18n('FAIL_TO_INSTALL_COMPONENTS', component.stringify()));
            fecom.errorHandler(err);
            return newInstalledList;
          });
      }, []);
    }).then(function (newInstalledList) {
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
      updateComponentJson(newInstalledList);
      return newInstalledList;
    })
    .catch(fecom.errorHandler);
};