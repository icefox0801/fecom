'use strict';

var path = require('path');

var fs = require('graceful-fs');
var ini = require('ini');

var helper = {};

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

helper.profileFile = path.join(getUserHome(), '.fecomrc');
helper.profileFileTmp = path.join(getUserHome(), '.fecomrc_tmp');
helper.init = function () {


  if (fs.existsSync(helper.profileFile)) {
    fs.renameSync(helper.profileFile, helper.profileFileTmp);
  }

  helper.profile = {
    username: 'icefox0801',
    email: 'icefox0801@hotmail.com',
    token: '4zWuy_my-jMuSnjLSkKv',
    defaults: {
      owner: 'icefox0801',
      domain: 'https://gitlab.com'
    }
  };

  fs.writeFileSync(helper.profileFile, ini.stringify(helper.profile));

  process.on('exit', function () {

    if (fs.existsSync(helper.profileFileTmp)) {
      fs.renameSync(helper.profileFileTmp, helper.profileFile);
    }

  });
};

helper.reset = function () {
  fs.writeFileSync(helper.profileFile, ini.stringify(helper.profile));
};

module.exports = helper;