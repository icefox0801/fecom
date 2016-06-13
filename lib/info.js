'use strict';

var _ = require('lodash');
var Table = require('cli-table');
var treeify = require('treeify');
var moment = require('moment');

var fecom = require('./fecom');
var Component = require('./component/Component');

module.exports = function (semantic) {
  var parsed = fecom.parse(semantic);
  var component = new Component(parsed, 'remote');

  return component.getInformation()
    .then(function (result) {
      var info = _.pick(result.info, ['name', 'description', 'owner', 'version', 'author']);
      var infoTable = new Table({
        colWidths: [15, 40]
      });
      _.forIn(info, function (value, key) {
        infoTable.push([key, value]);
      });
      var versionTable = new Table({
        head: ['version', 'detail'],
        colWidths: [15, 40]
      });
      var versions = result.versions.map(function (version) {
        var row = [];
        var meta = [];
        row.push(version.name);
        meta.push(version.commit.message.replace('\n', ''));
        meta.push(moment(version.commit.committed_date).format('YYYY-MM-DD HH:mm') + ' ' + version.commit.author_name);
        row.push(meta.join('\n'));
        return row;
      });

      versions.forEach(function (version) {
        versionTable.push(version);
      });

      fecom.logger.info(fecom.i18n('COMPONENT_INFORMATION', infoTable.toString()));
      fecom.logger.info(fecom.i18n('COMPONENT_VERSIONS', versionTable.toString()));
    })
    .catch(fecom.errorHandler);
};