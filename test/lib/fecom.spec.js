'use strict';

var fecom = require('../../lib/fecom');

fdescribe('fecom', function () {
  describe('parse comp_valid_version', function () {
    it('should return the correctly parsed object', function () {
      expect(fecom.parse('comp_valid_version')).toEqual({ owner: 'icefox0801', name: 'comp_valid_version' });
    });
  });
});