'use strict';

var fs = require('graceful-fs');

var setProfile = require('../../../lib/profile/setProfile');
var bddStdin = require('../../helpers/bddStdin');
var profile = require('../../helpers/profile');

describe('profile setProfile', function () {
  describe('with a key and no value', function () {
    it('should set the profile correctly', function (done) {
      bddStdin('test\n');
      setProfile('username')
        .then(function (newProfile) {
          expect(newProfile.username).toEqual('test');
          profile.reset();
          done();
        });
    });
  });
  describe('with a key and a value', function () {
    it('should set the profile correctly', function (done) {
      setProfile('username', 'test')
        .then(function (newProfile) {
          expect(newProfile.username).toEqual('test');
          profile.reset();
          done();
        });
    });
  });
  describe('with no key', function () {
    it('should throw an error', function () {
      expect(function () {
        setProfile();
      }).toThrowError(Error, 'Must specify a key param');
    });
  });
  describe('with invalid key', function () {
    it('should throw an error', function () {
      expect(function () {
        setProfile('invalid');
      }).toThrowError(Error, 'Cannot set value of invalid');
    });
  });
});