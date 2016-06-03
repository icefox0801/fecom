'use strict';

var fecom = require('../../lib/fecom');
var tree = require('../../lib/tree');

fdescribe('tree', function () {
  describe('all installed components', function () {
    it('should return a valid tree', function (done) {
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
      tree([], { cwd: fecom.root })
        .then(function (treeModel) {
          expect(treeModel.model).toEqual(expectedTree);
          done();
        });
    });
  });

  describe('specified installed component(s)', function () {
    it('should return a valid tree', function (done) {
      var expectedTree = {
        props: {
          name: 'fecom-demo',
          version: '1.0.0',
          owner: 'icefox0801'
        },
        subNodes: [
          {
            props: {
              name: 'comp_sub_b',
              owner: 'icefox0801',
              version: '1.0.1',
              specified: true
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
      };
      tree(['comp_sub_b'], { cwd: fecom.root })
        .then(function (treeModel) {
          expect(treeModel.model).toEqual(expectedTree);
          done();
        });
    });
  });

  describe('remote component(s)', function () {
    it('should return a valid tree', function (done) {
      var expectedTree = {
        props: {
          name: 'fecom-demo',
          version: '1.0.0',
          owner: 'icefox0801'
        },
        subNodes: [
          {
            props: {
              name: 'comp_deps_new',
              owner: 'icefox0801',
              version: '1.0.0'
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
          }
        ]
      };
      tree(['comp_deps_new'], { cwd: fecom.root, remote: true })
        .then(function (treeModel) {
          expect(treeModel.model).toEqual(expectedTree);
          done();
        });
    });
  });
});