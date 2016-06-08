'use strict';

var path = require('path');

var fs = require('graceful-fs');
var ini = require('ini');

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

module.exports = function () {

  var profileFile = path.join(getUserHome(), '.fecomrc');
  var profileFileTmp = path.join(getUserHome(), '.fecomrc_tmp');

  if (fs.existsSync(profileFile)) {
    fs.renameSync(profileFile, profileFileTmp);
  }

  var profile = {
    username: 'icefox0801',
    email: 'icefox0801@hotmail.com',
    token: '4zWuy_my-jMuSnjLSkKv',
    defaults: {
      owner: 'icefox0801',
      domain: 'https://gitlab.com'
    }
  };

  fs.writeFileSync(profileFile, ini.stringify(profile));

  process.on('exit', function () {
    fs.renameSync(profileFileTmp, profileFile);
  });
};