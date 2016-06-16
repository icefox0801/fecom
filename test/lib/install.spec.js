'use strict';

var fs = require('graceful-fs');
var path = require('path');

var reset = require('../helpers/reset');
var fecom = require('../../lib/fecom');
var install = require('../../lib/install');

describe('install', function () {
  beforeAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });
  describe('a component', function () {
    describe('plain components', function () {
      it('should install a valid component', function (done) {
        var expectedDependencies = [
          {
            owner: 'icefox0801',
            name: 'comp_deps',
            version: '1.0.0'
          },
          {
            owner: 'icefox0801',
            name: 'comp_sub_d',
            version: '1.0.1'
          },
          {
            owner: 'icefox0801',
            name: 'comp_valid_version',
            version: '1.1.2'
          }
        ];
        install(['comp_sub_d'], {})
          .then(function (dependencies) {
            expect(dependencies).toEqual(expectedDependencies);
            reset();
            done();
          });
      });
    });
    describe('with script', function () {
      it('should execute the script and install a valid component', function (done) {
        var expectedDependencies = [
          {
            owner: 'icefox0801',
            name: 'comp_deps',
            version: '1.0.0'
          },
          {
            owner: 'icefox0801',
            name: 'comp_valid_version',
            version: '1.1.2'
          },
          {
            owner: 'icefox0801',
            name: 'comp_with_script',
            version: '1.0.2'
          }
        ];
        install(['comp_with_script'], {})
          .then(function (dependencies) {
            var createdByScript = path.join(fecom.componentRoot, 'comp_with_script', 'createdByScript.js');
            expect(fs.existsSync(createdByScript)).toBeTruthy();
            expect(fs.readFileSync(createdByScript).toString()).toEqual('/* Created by script */');
            expect(dependencies).toEqual(expectedDependencies);
            reset();
            done();
          });
      });
    });
  });
});