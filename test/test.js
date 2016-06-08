'use strict';

var path = require('path');

var Jasmine = require('jasmine');
var profile = require('./helpers/profile');

profile();

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
});