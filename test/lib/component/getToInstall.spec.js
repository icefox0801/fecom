'use strict';

var path = require('path');

var _ = require('lodash');

var fecom = require('../../../lib/fecom');
var getToInstall = require('../../../lib/component/getToInstall');

describe('component getToInstall', function () {
  describe('specified components', function () {
    it('should return components to install', function (done) {
      var specified = [
        {
          owner: 'icefox0801',
          name: 'comp_deps',
          version: '1.0.0'
        }, {
          owner: 'icefox0801',
          name: 'comp_valid_version',
          version : '1.1.2'
        }
      ];
      getToInstall([])
        .then(function (components) {
          expect(components.map(function (component) {
            return _.pick(component, ['owner', 'name', 'version']);
          })).toEqual(specified);
          done();
        });
    });
  });
  describe('no specified components', function () {
    describe('some dependencies', function () {
      it('should return components to install', function (done) {
        var expected = [
          {
            owner: 'icefox0801',
            name: 'comp_deps',
            version: '1.0.0'
          }, {
            owner: 'icefox0801',
            name: 'comp_valid_version',
            version : '1.1.2'
          }
        ];
        getToInstall([])
          .then(function (components) {
            expect(components.map(function (component) {
              return _.pick(component, ['owner', 'name', 'version']);
            })).toEqual(expected);
            done();
          });
      });
    });
    describe('no dependencies', function () {
      it('should throw an error', function () {
        var _dependencies = fecom.config.dependencies;
        fecom.config.dependencies = [];
        expect(function () {
          getToInstall([]);
        }).toThrowError(Error, fecom.i18n('NO_COMPONENT_TO_INSTALL'));
        fecom.config.dependencies = _dependencies;
      });
    });
  });
});