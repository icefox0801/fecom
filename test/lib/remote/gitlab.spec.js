'use strict';

var fs = require('graceful-fs');

var _ = require('lodash');
var Promise = require('bluebird');

var fecom = require('../../../lib/fecom');
var bootstrap = require('../../../lib/bootstrap');
var gitlabRepo = require('../../../lib/remote/gitlab');

describe('remote gitlab', function () {
  var expectedNode = {
    name: 'icefox0801/comp_deps@1.0.0',
    dependencies: [
      'icefox0801/comp_sub_a@1.1.0',
      'icefox0801/comp_sub_b@1.0.1'
    ]
  };
  beforeAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });
  describe('getArchive', function () {
    describe('icefox0801/comp_sub_a@1.1.0', function () {
      it('should download valid archive', function (done) {
        gitlabRepo.getArchive('icefox0801', 'comp_sub_a', '1.1.0')
          .then(function (archivePath) {
            var stats = fs.lstatSync(archivePath);
            expect(stats.size).toEqual(3816);
            done();
          });
      });
    });
  });
  describe('validate', function () {
    describe('icefox0801/comp_valid_version@1.1.2', function () {
      it('should return valid component.json', function (done) {
        gitlabRepo.validate('icefox0801', 'comp_valid_version', '1.1.2')
          .then(function (json) {
            expect(json.version).toBe('1.1.2');
            expect(json.name).toBe('comp_valid_version');
            done();
          });
      });
    });
    describe('icefox0801/comp_valid_version@1.0.99', function () {
      it('should return empty string', function (done) {
        Promise
          .try(function () {
            return gitlabRepo.validate('icefox0801', 'comp_valid_version', '1.0.99');
          })
          .catch(function (err) {
            expect(err.message).toEqual('"component.json" not found in icefox0801/comp_valid_version');
            done();
          });
      });
    });
  });
  describe('getLatestTag', function () {
    describe('icefox0801/comp_valid_version', function () {
      it('should return tag 1.1.2', function (done) {
        gitlabRepo.getLatestTag('icefox0801', 'comp_valid_version')
          .then(function (tag) {
            expect(tag.name).toBe('1.1.2');
            done();
          });
      });
    });
  });
  describe('getDependencies', function () {
    describe('icefox0801/comp_deps', function () {
      it('should return valid dependencies tree', function (done) {
        gitlabRepo.getDependencies('icefox0801', 'comp_deps', '1.0.0')
          .then(function (tree) {
            expect(tree).toEqual(expectedNode);
            done();
          });
      });
    });
  });

  describe('searchComponents', function () {
    describe('with a pattern', function () {
      it('should return valid searching results', function (done) {
        var expectedResults = [{
          name: 'comp_sub_a',
          owner: 'icefox0801',
          description: 'A magic component',
          version: '1.1.1'
        }];
        gitlabRepo.searchComponents('comp_sub_a')
          .then(function (results) {
            expect(results).toEqual(expectedResults);
            done();
          });
      });
    });
    describe('by component name', function () {
      it('should return valid searching results', function (done) {
        var expectedResults = [{
          name: 'comp_sub_a',
          owner: 'icefox0801',
          description: 'A magic component',
          version: '1.1.1'
        }];
        gitlabRepo.searchComponents('comp_sub_a', { byName: true })
          .then(function (results) {
            expect(results).toEqual(expectedResults);
            done();
          });
      });
    });
  });
});

