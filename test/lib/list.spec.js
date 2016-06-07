'use strict';

var fecom = require('../../lib/fecom');
var list = require('../../lib/list');

describe('list', function () {
  describe('installed', function () {
    it('should return valid installed components', function (done) {
      var expectedInstalled = [
        {
          name: 'comp_deps',
          owner: 'icefox0801',
          version: '1.0.0',
          hasUpdate: false,
          latest: ''
        },
        {
          name: 'comp_sub_a',
          owner: 'icefox0801',
          version: '1.1.0',
          hasUpdate: false,
          latest: ''
        },
        {
          name: 'comp_sub_b',
          owner: 'icefox0801',
          version: '1.0.1',
          hasUpdate: false,
          latest: ''
        },
        {
          name: 'comp_valid_version',
          owner: 'icefox0801',
          version: '1.1.2',
          hasUpdate: false,
          latest: ''
        }
      ];
      list([], { cwd: fecom.root })
        .then(function (installed) {
          expect(installed).toEqual(expectedInstalled);
          done();
        });
    });
  });

  describe('installed update', function () {
    it('should return valid installed components', function (done) {
      var expectedInstalled = [
        {
          name: 'comp_deps',
          owner: 'icefox0801',
          version: '1.0.0',
          hasUpdate: false,
          latest: ''
        },
        {
          name: 'comp_sub_a',
          owner: 'icefox0801',
          version: '1.1.0',
          hasUpdate: true,
          latest: '1.1.1'
        },
        {
          name: 'comp_sub_b',
          owner: 'icefox0801',
          version: '1.0.1',
          hasUpdate: false,
          latest: ''
        },
        {
          name: 'comp_valid_version',
          owner: 'icefox0801',
          version: '1.1.2',
          hasUpdate: false,
          latest: ''
        }
      ];
      list([], { cwd: fecom.root, update: true })
        .then(function (installed) {
          expect(installed).toEqual(expectedInstalled);
          done();
        });
    });
  });
});