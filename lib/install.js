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
    .then(function (tree) {
      var toInstallAll = _(tree).flattenDeep().tail().value().map(function (parsed) {
        return new Component(parsed, 'remote');
      });

      return Promise.reduce(toInstallAll, function (installedPath, component) {
        return component.install()
          .then(function (filePath) {
            installedPath.push(filePath);
            return installedPath;
          });
      }, []);

    })
    .then(function (newInstalled) {
      fecom.logger.info('Finishing installing components');
      var map = {};
      var rootName = fecom.config.name;
      var rootVersion = fecom.config.version;
      var tree, str;

      if(!newInstalled.length) {
        fecom.logger.info('No component was installed');
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