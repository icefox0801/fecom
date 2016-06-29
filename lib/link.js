'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var ini = require('ini');
var jsonfile = require('jsonfile');
var Promise = require('bluebird');

var fecom = require('./fecom');

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

module.exports = function (semantic) {
  var componentJson = path.join(fecom.root, 'component.json');
  var profile = fecom.profile;
  var profileFile = path.join(getUserHome(), '.fecomrc');
  var linkMap = _.assign({}, profile.link);

  return Promise
    .try(function () {

      if (!semantic) {

        if (!fs.existsSync(componentJson)) {
          throw new Error(fecom.i18n('ERROR_NOT_VALID_COMPONENT_DIRECTORY'));
        }

        var json = jsonfile.readFileSync(componentJson);
        var componentName = json.name;
        linkMap[componentName] = fecom.root;
        profile.link = linkMap;
        fs.writeFileSync(profileFile, ini.stringify(profile));
        fecom.logger.info(fecom.i18n('LINK_REGISTERED', componentName.blue, fecom.root));
      } else {
        var parsed = fecom.parse(semantic);

        if (!linkMap.hasOwnProperty(parsed.name) || !linkMap[parsed.name]) {
          throw new Error(fecom.i18n('ERROR_NO_LINK_FOUND', parsed.name));
        }

        var target = linkMap[parsed.name];
        var linkPath = path.join(fecom.componentRoot, parsed.name);

        if (!fs.existsSync(target)) {
          throw new Error(fecom.i18n('ERROR_LINK_TARGET_NOT_EXIST'));
        }

        if (!fs.existsSync(fecom.componentRoot)) {
          fs.mkdirSync(fecom.componentRoot);
        }

        if (fs.existsSync(linkPath)) {
          throw new Error(fecom.i18n('LINK_PATH_EXISTS'));
        }

        fs.symlinkSync(target, linkPath);
        fecom.logger.info(fecom.i18n('LINKED_COMPONENT', parsed.name.blue));
      }
    })
    .catch(fecom.errorHandler);

};