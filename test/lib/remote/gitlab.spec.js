'use strict';

var Promise = require('bluebird');

var fecom = require('../../../lib/fecom');
var bootstrap = require('../../../lib/bootstrap');
var gitlabRepo = require('../../../lib/remote/gitlab');

describe('remote gitlab', function () {
  describe('validate', function () {
    describe('valid version icefox0801/comp_valid_version@1.1.2', function () {
      it('should return 1.1.2', function (done) {
        gitlabRepo.validate('icefox0801', 'comp_valid_version', '1.1.2')
          .then(function (version) {
            expect(version).toBe('1.1.2');
            done();
          });
      });
    });
    describe('invalid version icefox0801/comp_valid_version@1.0.99', function () {
      it('should return empty string', function (done) {
        Promise
          .try(function () {
            return gitlabRepo.validate('icefox0801', 'comp_valid_version', '1.9.9');
          })
          .catch(function (err) {
            expect(err.message).toEqual('"component.json" not found in icefox0801/comp_valid_version');
            done();
          });
      });
    });
  });
  describe('getLatestTag', function () {
    describe('latest tag icefox0801/comp_valid_version', function () {
      it('should return 1.1.2', function (done) {
        gitlabRepo.getLatestTag('icefox0801', 'comp_valid_version')
          .then(function (version) {
            expect(version).toBe('1.1.2');
            done();
          });
      });
    });
  });
  describe('getComponentJson', function () {});
});

