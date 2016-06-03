'use strict';

var path = require('path');

var fs = require('graceful-fs');
var Jasmine = require('jasmine');

var fecom = require('../lib/fecom');
var reset = require('./helpers/reset');
var bootstrap = require('../lib/bootstrap');
var gitlabRepo = require('../lib/remote/gitlab');

var jasmine = new Jasmine();

jasmine.loadConfig({
  "spec_dir": "test",
  "spec_files": [
    "lib/**/*.spec.js"
  ]
});

fecom.on('ready', function () {
  gitlabRepo.initialize();
  jasmine.execute();
});

reset();

bootstrap({
  cwd: path.join(__dirname, 'mock')
}, {
  username: 'icefox0801',
  email: 'icefox0801@hotmail.com',
  token: '4zWuy_my-jMuSnjLSkKv'
}, {
  owner: 'icefox0801',
  domain: 'https://gitlab.com'
});