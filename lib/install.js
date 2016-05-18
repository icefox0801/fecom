'use strict';

var fs = require('graceful-fs');

var AdmZip = require('adm-zip');
var Promise = require('bluebird');

var fecom = require('./fecom');
var gitlabRepo = require('./remote/gitlab');
var getInstalled = require('./component/getInstalled');
var getToInstall = require('./component/getToInstall');
var analysize = require('./component/analysize');

module.exports = function (list, options) {
  var parsedList = list.map(function (str) {
    return fecom.parse(str);
  });
  return Promise
    .all([getInstalled(), getToInstall(parsedList)])
    .then(function (results) {
      var installed = results[0];
      var toInstall = results[1];
      return analysize(toInstall, installed);
    })
    .catch(fecom.errorHandler);
  //getConfig(options)
  //  .then(function (config) {
  //    var toInstall = config.dependencies;
  //    return gitlabRepo.validate('icefox0801', 'comp_valid_version');
  //  })
  //  .then(function (version) {
  //    var req = gitlabRepo.getArchive('zhaojianfei', 'widgets', version);
  //    var stream = fs.createWriteStream('widgets-archive.tar.gz');
  //    req.on('data', function (data) {
  //      stream.write(data);
  //    });
  //    req.on('end', function () {
  //      stream.on('finish', function () {
  //        var zip = new AdmZip('widgets-archive.tar.gz');
  //        zip.extractAllTo('components');
  //      });
  //      stream.end();
  //    });
  //  })
  //  .catch(fecom.errorHandler);

};