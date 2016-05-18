'use strict';

var path = require('path');

var Jasmine = require('jasmine');

var fecom = require('../lib/fecom');
var bootstrap = require('../lib/bootstrap');
var gitlabRepo = require('../lib/remote/gitlab');

var jasmine = new Jasmine();

jasmine.loadConfig({
  "spec_dir": "test",
  "spec_files": [
    "lib/*.spec.js",
    "lib/component/*.spec.js",
    "lib/util/*.spec.js",
    "!lib/remote/*.spec.js"
  ]
});

fecom.on('ready', function () {
  gitlabRepo.initialize();
  jasmine.execute();
});

bootstrap({
  cwd: path.join(__dirname, 'mock')
}, {
  username: 'icefox0801',
  email: 'icefox0801@hotmail.com',
  token: '4zWuy_my-jMuSnjLSkKv'
}, {
  owner: 'icefox0801',
  domain: 'http://gitlab.com'
});