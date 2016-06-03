'use strict';

var reset = require('../helpers/reset');
var fecom = require('../../lib/fecom');
var install = require('../../lib/install');

fdescribe('install', function () {
  describe('a component', function () {
    it('should install a valid component', function (done) {
      install(['comp_sub_d'], { cwd: fecom.root })
        .then(function (dependencies) {
          expect(dependencies).toEqual([{
            name: 'comp_sub_d',
            owner: 'icefox0801',
            version: '1.0.1',
            resolved: false,
            specified: true
          }]);
          reset();
          done();
        });
    });
  });
});