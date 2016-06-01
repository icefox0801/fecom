'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');

var fecom = require('../fecom');
var Component = require('./Component');
var Tree = require('./Tree');

module.exports = function () {
  var componentDir = fecom.componentRoot;
  var files = [];
  var dependencies = fecom.config.dependencies || [];
  var children;
  dependencies = dependencies.map(function (semantic) {
    var parsed = fecom.parse(semantic);

    if (!(parsed.hasOwnProperty('resolved') && parsed.resolved)) {
      parsed.specified = true;
    }

    return parsed;
  });

  children = dependencies.map(function (parsed) {
    return {
      props: parsed
    };
  });

  var rootComponent = new Component(null, 'root', {
    children: children
  });

  if (fs.existsSync(componentDir)) {
    files = fs.readdirSync(componentDir);
  }

  files = files.filter(function (file) {
    return !_.startsWith(file, '.');
  });

  return rootComponent.getLocalDependenciesTree()
    .then(function (filledTree) {
      var treeModel = new Tree(filledTree);
      var installed = treeModel.getAllNodes().slice(1);
      return Promise.all(files.map(function (file) {
        var matchedSpecified = _.find(dependencies, { name: file }) || {};
        var matchedInstalled = _.find(installed, { name: file}) || {};
        var schema = {
          name: file,
          owner: matchedSpecified.owner || matchedInstalled.owner || fecom.config.owner,
          specified: Boolean(matchedSpecified.specified),
          resolved: Boolean(matchedSpecified.resolved)
        };

        return fecom.async(new Component(schema, 'local'));
      }));
    });

};