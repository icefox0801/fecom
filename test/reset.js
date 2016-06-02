'use strict';

var path = require('path');

var fs = require('graceful-fs');
var fse = require('fs-extra');
var AdmZip = require('adm-zip');

module.exports = function () {
  var mockDir = path.join(__dirname, 'mock');

  if (fs.existsSync(mockDir)) {
    fse.removeSync(path.join(__dirname, 'mock'));
  }

  var zip = new AdmZip(path.join(__dirname, 'mock.zip'));
  zip.extractAllTo(mockDir, true);
};