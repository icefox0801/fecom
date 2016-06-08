'use strict';

var fecom = require('../../lib/fecom');

describe('fecom', function () {
  describe('parse', function () {
    describe('a valid semantic name', function () {
      it('should return the correctly parsed object', function () {
        expect(fecom.parse('comp_valid_version')).toEqual({ owner: 'icefox0801', name: 'comp_valid_version' });
      });
    });
    describe('a valid resolved semantic name', function () {
      it('should return the correctly parsed object', function () {
        expect(fecom.parse('*comp_valid_version')).toEqual({ owner: 'icefox0801', name: 'comp_valid_version', resolved: true });
      });
    });
  });
  describe('errorHandler', function () {
    describe('handle an string', function () {
      it('should print valid error message', function (done) {
        process.stdout.once('data', function (data) {
          expect(data.message).toBe('An error occurred');
          done();
        });
        fecom.errorHandler('An error occurred');
      });
    });

    describe('handle an error', function () {
      it('should print valid error message', function (done) {
        process.stdout.once('data', function (data) {
          expect(data.message).toBe('An error occurred');
          done();
        });
        fecom.errorHandler(new Error('An error occurred'));
      });
    });

    describe('handle an error with conflict list', function () {
      it('should print valid error message', function (done) {
        var err = new Error('An error occurred');
        err.conflictList = [
          {
            name: 'comp_sub_a',
            owners: ['icefox0801', 'icefox0802']
          },
          {
            name: 'comp_sub_b',
            owners: ['icefox0801', 'icefox0802']
          }
        ];
        process.stdout.once('data', function (data) {
          expect(data.message).toBe('An error occurred');
          expect(data.conflictList).toEqual(err.conflictList);
          done();
        });
        fecom.errorHandler(err);
      });
    });
  });
});