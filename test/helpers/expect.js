'use strict';

var suppose = require('suppose');

var fecom = require('../../lib/fecom');

suppose('npm', ['run', 'coverage'])
  .when(new RegExp(fecom.i18n('ENTER_USERNAME'))).respond('icefox0801\n')
  .when(new RegExp(fecom.i18n('ENTER_EMAIL'))).respond('icefox0801@hotmail.com\n')
  .when(new RegExp(fecom.i18n('ENTER_TOKEN'))).respond('4zWuy_my-jMuSnjLSkKv\n')
  .on('error', function (err) {
    console.log(err.message);
  })
  .end(function (code) {
    console.log(code);
  });