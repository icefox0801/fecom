'use strict';

var path = require('path');

var jsonfile = require('jsonfile');

var fecom = require('../../../lib/fecom');
var initPackage = require('../../../lib/component/package');

fdescribe('component package', function () {
  it('should create a valid package.json', function () {
    var cwd = path.join(fecom.root, '.tmp');
    var config = {
      name: 'tmp',
      description: 'A test component',
      author: 'icefox0801<icefox0801@hotmail.com>'
    };
    initPackage(config, { cwd: cwd });
    var json = jsonfile.readFileSync(path.join(cwd, 'package.json'));
    expect(json).toEqual(config);
  });
});