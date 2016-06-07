'use strict';

var Promise = require('bluebird');

var fecom = require('../../../lib/fecom');
var getInstalled = require('../../../lib/component/getInstalled');
var getToInstall = require('../../../lib/component/getToInstall');
var analyze = require('../../../lib/component/analyze');

describe('component analyze', function () {
  beforeAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });
  describe('by ask strategy', function () {
    describe('component not installed', function () {
      it('should return the dependencies tree', function (done) {
        var parsed = fecom.parse('comp_sub_c@1.0.2');
        var expectedFilledTree = {
          props: {
            name: 'fecom-demo',
            owner: 'icefox0801',
            version: '1.0.0'
          },
          subNodes: [
            {
              props: {
                name: 'comp_sub_c',
                owner: 'icefox0801',
                version: '1.0.2',
                specified: true
              },
              subNodes: [
                {
                  props: {
                    name: 'comp_sub_d',
                    owner: 'icefox0801',
                    version: '1.0.0'
                  },
                  subNodes: []
                }
              ]
            }
          ]
        };
        Promise
          .props({
            installed: getInstalled(),
            toInstall: getToInstall([parsed])
          })
          .then(function (results) {
            var installed = results.installed;
            var toInstall = results.toInstall;
            return analyze(toInstall, installed);
          })
          .then(function (treeModel) {
            expect(treeModel.model).toEqual(expectedFilledTree);
            done();
          });
      });
    });
  });
  describe('by latest strategy', function () {
    describe('component has conflict dependencies', function () {
      it('should return the dependencies tree', function (done) {
        var parsed = fecom.parse('comp_deps_new@1.0.0');
        var expectedFilledTree = {
          props: {
            name: 'fecom-demo',
            owner: 'icefox0801',
            version: '1.0.0'
          },
          subNodes: [
            {
              props: {
                name: 'comp_deps_new',
                owner: 'icefox0801',
                version: '1.0.0',
                specified: true
              },
              subNodes: [
                {
                  props: {
                    name: 'comp_sub_d',
                    owner: 'icefox0801',
                    version: '1.0.1'
                  },
                  subNodes: []
                },
                {
                  props: {
                    name: 'comp_sub_c',
                    owner: 'icefox0801',
                    version: '1.0.2'
                  },
                  subNodes: []
                }
              ]
            }
          ]
        };
        Promise
          .props({
            installed: getInstalled(),
            toInstall: getToInstall([parsed])
          })
          .then(function (results) {
            var installed = results.installed;
            var toInstall = results.toInstall;
            return analyze(toInstall, installed, 'latest');
          })
          .then(function (treeModel) {
            expect(treeModel.model).toEqual(expectedFilledTree);
            done();
          });
      });
    });
  });
});