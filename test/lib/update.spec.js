'use strict';

var _ = require('lodash');

var reset = require('../helpers/reset');
var fecom = require('../../lib/fecom');
var update = require('../../lib/update');

fdescribe('update', function () {
  describe('a component', function () {
    it('should update a valid component', function (done) {
      update(['comp_sub_a'], {})
        .then(function (newInstalledList) {
          var expectedNewInstalledList = [
            {
              owner: 'icefox0801',
              name: 'comp_sub_a',
              version: '1.1.1'
            }
          ];
          expect(newInstalledList.map(function (component) {
            return _(component).pick(['name', 'owner', 'version']).value();
          })).toEqual(expectedNewInstalledList);
          reset();
          done();
        });
    });
  });
});