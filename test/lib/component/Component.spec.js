'use strict';

var fecom = require('../../../lib/fecom');
var Component = require('../../../lib/component/Component');

fdescribe('component constructor', function () {

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
                specified: true
              },
              subNodes: [
                {
                  props: {
                    name: 'comp_sub_a',
                    owner: 'icefox0801',
                    version: '1.1.0'
                  },
                  subNodes: []
                },
                {
                  props: {
                    name: 'comp_sub_b',
                    owner: 'icefox0801',
                    version: '1.0.1'
                  },
                  subNodes: [
                    {
                      props: {
                        name: 'comp_sub_a',
                        owner: 'icefox0801',
                        version: '1.1.0',
                        status: undefined
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
                specified: true
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
            specified: true
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
                specified: true
              },
              subNodes: [
                {
                  props: {
                    name: 'comp_sub_a',
                    owner: 'icefox0801',
                    version: '1.1.0'
                  },
                  subNodes: []
                },
                {
                  props: {
                    name: 'comp_sub_b',
                    owner: 'icefox0801',
                    version: '1.0.1'
                  },
                  subNodes: [
                    {
                      props: {
                        name: 'comp_sub_a',
                        owner: 'icefox0801',
                        version: '1.1.0',
                        status: undefined
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
});