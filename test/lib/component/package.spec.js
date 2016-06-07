'use strict';

var path = require('path');

var jsonfile = require('jsonfile');

var fecom = require('../../../lib/fecom');
var initPackage = require('../../../lib/component/package');
var reset = require('../../helpers/reset');

describe('component package', function () {
  it('should create a valid package.json', function () {
    var config = {
      name: 'test',
      description: 'A test component',
      author: 'icefox0801<icefox0801@hotmail.com>'
    };
    initPackage(config);
    var json = jsonfile.readFileSync(path.join(fecom.root, 'package.json'));
    expect(json.name).toEqual(config.name);
    expect(json.description).toEqual(config.description);
    expect(json.author).toEqual(config.author);
    reset();
  });
});