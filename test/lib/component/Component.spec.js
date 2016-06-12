'use strict';

var fs = require('graceful-fs');

var fecom = require('../../../lib/fecom');
var Component = require('../../../lib/component/Component');
var reset = require('../../helpers/reset');

describe('component constructor', function () {

  beforeAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });
  describe('getLocalDependenciesTree', function () {
    describe('all dependencies', function () {
      it('should return valid local dependencies tree', function (done) {
        var component = new Component(null, 'root');
        var expectedTree = {
          props: {
            name: 'fecom-demo',
            version: '1.0.0',
            owner: 'icefox0801'
          },
          subNodes: [
            {
              props: {
                name: 'comp_deps',
                owner: 'icefox0801',
                version: '1.0.0',
                specified: true,
                installed: true
              },
              subNodes: [
                {
                  props: {
                    name: 'comp_sub_a',
                    owner: 'icefox0801',
                    version: '1.1.0',
                    installed: true
                  },
                  subNodes: []
                },
                {
                  props: {
                    name: 'comp_sub_b',
                    owner: 'icefox0801',
                    version: '1.0.1',
                    installed: true
                  },
                  subNodes: [
                    {
                      props: {
                        name: 'comp_sub_a',
                        owner: 'icefox0801',
                        version: '1.1.0',
                        status: undefined,
                        installed: true
                      },
                      subNodes: []
                    }
                  ]
                }
              ]
            },
            {
              props: {
                name: 'comp_valid_version',
                version: '1.1.2',
                owner: 'icefox0801',
                specified: true,
                installed: true
              },
              subNodes: []
            }
          ]
        };

        component.getLocalDependenciesTree()
          .then(function (filledTree) {
            expect(filledTree).toEqual(expectedTree);
            done();
          });
      });
    });
    describe('specified dependency', function () {
      it('should return valid local dependencies tree', function (done) {
        var children = [{
          props: {
            name: 'comp_deps',
            owner: 'icefox0801',
            version: '1.0.0',
            specified: true,
            installed: true
          }
        }];
        var component = new Component(null, 'root', { children: children });
        var expectedTree = {
          props: {
            name: 'fecom-demo',
            version: '1.0.0',
            owner: 'icefox0801'
          },
          subNodes: [
            {
              props: {
                name: 'comp_deps',
                owner: 'icefox0801',
                version: '1.0.0',
                specified: true,
                installed: true
              },
              subNodes: [
                {
                  props: {
                    name: 'comp_sub_a',
                    owner: 'icefox0801',
                    version: '1.1.0',
                    installed: true
                  },
                  subNodes: []
                },
                {
                  props: {
                    name: 'comp_sub_b',
                    owner: 'icefox0801',
                    version: '1.0.1',
                    installed: true
                  },
                  subNodes: [
                    {
                      props: {
                        name: 'comp_sub_a',
                        owner: 'icefox0801',
                        version: '1.1.0',
                        status: undefined,
                        installed: true
                      },
                      subNodes: []
                    }
                  ]
                }
              ]
            }
          ]
        };
        component.getLocalDependenciesTree()
          .then(function (filledTree) {
            expect(filledTree).toEqual(expectedTree);
            done();
          });
      });
    });
  });

  describe('uninstall', function () {
    describe('a component', function () {
      it('should uninstall the valid component', function (done) {
        var component = new Component({
          name: 'comp_valid_version',
          owner: 'icefox0801',
          version: '1.1.2',
          specified: true,
          installed: true
        });
        component.uninstall()
          .then(function (component) {
            expect(fs.existsSync(component.fullpath)).toBeFalsy();
            expect(component.installed).toBeFalsy();
            reset();
            done();
          });
      });
    });
  });

  describe('getInformation', function () {
    describe('a component', function () {
      it('should return valid component information', function (done) {
        var expectedInfo = {
          name: 'comp_valid_version',
          owner: 'icefox0801',
          version: '1.1.2',
          description: 'A magic component',
          author: 'icefox0801<icefox0801@hotmail>'
        };
        var expectedVersions = ['1.1.2', '1.1.1', '1.0.1', '1.0.0'];
        var component = new Component({
          name: 'comp_valid_version',
          owner: 'icefox0801',
          version: '1.1.2'
        }, 'remote');
        component.getInformation()
          .then(function (result) {
            expect(result.info).toEqual(expectedInfo);
            expect(result.versions.map(function (version) {
              return version.name;
            })).toEqual(expectedVersions);
            done();
          });
      });
    });
  });
});