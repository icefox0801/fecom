'use strict';

var _ = require('lodash');
var treeify = require('treeify');

var fecom = require('./fecom');
var getInstalled = require('./component/getInstalled');

module.exports = function (components, options) {

  getInstalled()
    .then(function (installed) {
      var map = {};
      var rootName = fecom.config.name;
      var rootVersion = fecom.config.version;
      var tree, str;

      if(components.length) {
        installed = installed.filter(function (component) {
          return ~components.indexOf(component.name);
        });
      }

      map = _.zipObject(installed.map(function (component) {
        return component.name + '@' + component.version;
      }));

      tree = treeify.asTree(map);
      str = rootName ? (rootName + (rootVersion ? '@' + rootVersion : '') + '\n') : '';

      fecom.logger.info('Component versions: \n' + str + tree);

    });

};