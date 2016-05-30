'use strict';

var treeify = require('treeify');

var fecom = require('./fecom');
var Component = require('./component/Component');
var Tree = require('./component/Tree');
var getInstalled = require('./component/getInstalled');

module.exports = function (semList, options) {
  var promise;
  var root = {
    name: fecom.config.name,
    owner: fecom.profile.username,
    version: fecom.config.version
  };

  if(options.remote) {

  } else {
    promise = getInstalled()
      .then(function (installed) {
        var children = installed.map(function (component) {
          return {
            props: {
              name: component.name,
              owner: component.owner,
              version: component.version,
              specified: true
            }
          };
        });

        var rootComponent = new Component(root, 'root', {
          children: children
        });

        return rootComponent.getLocalDependenciesTree();
      });
  }

  promise
    .then(function (filledTree) {
      var treeModel = new Tree(filledTree);
      var treeMap = treeify.asTree(treeModel.transform());
      fecom.logger.info(fecom.i18n('DEPENDENCIES_TREE') + '\n' + treeMap);
      // fecom.logger.info(fecom.i18n('FINISH_ANALYZING_DEPENDENCIES'));
      return treeModel;
    })
    .catch(fecom.errorHandler);

};