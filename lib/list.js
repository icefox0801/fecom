'use strict';

var _ = require('lodash');
var treeify = require('treeify');

var fecom = require('./fecom');
var getInstalled = require('./component/getInstalled');
var Spinner = require('cli-spinner').Spinner;

var spinner = new Spinner(fecom.i18n('CHECKING_UPDATE'));

module.exports = function (semList, options) {

  return getInstalled()
    .then(function (installed) {

      if (semList.length) {
        installed = installed.filter(function (component) {
          return ~semList.indexOf(component.name);
        });
      }

      return installed;
    })
    .then(function (installed) {

      if (options.update) {
        spinner.setSpinnerString('|/-\\');
        spinner.start();
        return Promise.all(installed.map(function (component) {
          return component.checkUpdate();
        }));
      }

      return installed;
    })
    .then(function (installed) {
      var map = {};
      var rootName = fecom.config.name;
      var rootVersion = fecom.config.version;
      var tree, str;

      if (options.update) {
        spinner.stop(true);
      }

      map = _.zipObject(installed.map(function (component) {

        if (options.update) {
          component.status = component.hasUpdate ? component.latest.yellow : fecom.i18n('NO_UPDATE_AVAILABLE');
        }

        return component.stringify();
      }));

      tree = treeify.asTree(map);

      str = rootName ? (rootName + (rootVersion ? '@' + rootVersion : '') + '\n') : '';

      fecom.logger.info(fecom.i18n('COMPONENT_VERSIONS', str + tree));
      return installed.map(function (component) {
        return _(component).pick(['name', 'owner', 'version', 'hasUpdate', 'latest']).value();
      });
    })
    .catch(fecom.errorHandler);

};