'use strict';

var reset = require('../helpers/reset');
var fecom = require('../../lib/fecom');
var install = require('../../lib/install');

describe('install', function () {
  describe('a component', function () {
    it('should install a valid component', function (done) {
      install(['comp_sub_d'], { cwd: fecom.root })
        .then(function (dependencies) {
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
          expect(dependencies).toEqual(expectedDependencies);
          reset();
          done();
        });
    });
  });
});