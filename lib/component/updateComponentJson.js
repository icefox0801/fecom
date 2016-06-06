'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var jsonfile = require('jsonfile');

var fecom = require('../fecom');
var mergeDependencies = require('./mergeDependencies');

module.exports = function (incomingList, toRemove) {
  // IncomingList can be installed or uninstalled
  var oldDependenciesMap = fecom.config.dependencies;
  var oldParsedList = oldDependenciesMap.map(function (semantic) {
    return fecom.parse(semantic);
  });
  // Filter specified and resolved
  incomingList = incomingList.slice().filter(function (component) {
    return component.specified  || component.resolved;
  });

  var newParsedList = incomingList.map(function (parsed) {
    return _.pick(parsed, ['name', 'owner', 'version', 'resolved', 'specified']);
  });

  var componentJson = path.join(fecom.root, 'component.json');
  var json = {};

  if (fs.existsSync(componentJson)) {

    json = jsonfile.readFileSync(componentJson);

    if (toRemove) {
      // Remove new dependencies from old dependencies
      json.dependencies = _.pullAllWith(oldParsedList, newParsedList, function (oldParsed, newParsed) {
        return _.isMatch(newParsed, _.pick(oldParsed, ['name', 'owner']));
      }).map(function (parsed) {
        return fecom.stringify(parsed);
      }).sort();
    } else {
      // Merge old and new dependencies
      var mergedDependencies = mergeDependencies(newParsedList, oldParsedList);
      json.dependencies = _.unionWith(mergedDependencies, oldParsedList, function (oldParsed, newParsed) {
        return _.isMatch(newParsed, _.pick(oldParsed, ['name', 'owner']));
      }).map(function (parsed) {
        return fecom.stringify(parsed);
      }).sort();
    }

    jsonfile.writeFileSync(componentJson, json, { spaces: 2 });
    return json.dependencies.map(function (semantic) {
      return fecom.parse(semantic);
    });
  }

  return newParsedList;
};