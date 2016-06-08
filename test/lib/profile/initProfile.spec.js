'use strict';

var fs = require('graceful-fs');

var initProfile = require('../../../lib/profile/initProfile');
var bddStdin = require('../../helpers/bddStdin');
var profile = require('../../helpers/profile');

describe('profile initProfile', function () {
  it('should init a valid profile file', function (done) {
    var expected = {
      username: 'test',
      email: 'test@demo.com',
      token: '12345123451234512345'
    };
    bddStdin('test\n', 'test@demo.com\n', '12345123451234512345\n');
    initProfile()
      .then(function (answers) {
        expect(answers).toEqual(expected);
        profile.reset();
        done();
      });

  });
});