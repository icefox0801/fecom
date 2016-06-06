'use strict';

var _ = require('lodash');
var fecom = require('../../../lib/fecom');
var Tree = require('../../../lib/component/Tree');
var walkable = Tree.walkable;

fdescribe('component Tree', function () {
  var model = {
    props: {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    },
    subNodes: [
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
              version: '1.0.1'
            },
            subNodes: []
          }
        ]
      },
      {
        props: {
          name: 'comp_sub_a',
          owner: 'icefox0801',
          version: '1.1.0'
        },
        subNodes: []
      }
    ]
  };
  var root = {
    props: {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    }
  };
  var expectedMap = {
    'icefox0801/comp_deps@1.0.0': {
      'icefox0801/comp_sub_b@1.0.1': {
        'icefox0801/comp_sub_a@1.0.1': {}
      },
      'icefox0801/comp_sub_a@1.1.0': {}
    }
  };
  var expectedDFSNodes = [
    {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    },
    {
      name: 'comp_sub_b',
      owner: 'icefox0801',
      version: '1.0.1'
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.0.1'
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.1.0'
    }
  ];
  var expectedBFSNodes = [
    {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    },
    {
      name: 'comp_sub_b',
      owner: 'icefox0801',
      version: '1.0.1'
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.1.0'
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.0.1'
    }
  ];
  var expectedDFSPaths = [
    [ 'icefox0801/comp_deps@1.0.0' ],
    [ 'icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_b@1.0.1' ],
    [ 'icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_b@1.0.1', 'icefox0801/comp_sub_a@1.0.1' ],
    [ 'icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_a@1.1.0' ]
  ];
  var expectedMatchedPaths = [
    [ 'icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_b@1.0.1', 'icefox0801/comp_sub_a@1.0.1' ],
    [ 'icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_a@1.1.0' ]
  ];
  var expectedRemovedTree = {
    props: {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.1.0'
    },
    subNodes: []
  };
  var expectedTreeAfterRemove = {
    props: {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    },
    subNodes: [
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
              version: '1.0.1'
            },
            subNodes: []
          }
        ]
      }
    ]
  };
  var expectedUpdatedTree = {
    props: {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.1.0',
      resolved: true
    },
    subNodes: []
  };
  var expectedTreeAfterUpdate = {
    props: {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    },
    subNodes: [
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
              version: '1.0.1'
            },
            subNodes: []
          }
        ]
      },
      {
        props: {
          name: 'comp_sub_a',
          owner: 'icefox0801',
          version: '1.1.0',
          resolved: true
        },
        subNodes: []
      }
    ]
  };
  var treeModel = new Tree(model);
  var getChildren = function (target) {
    treeModel.walk('DFS', function (tree) {
      var node = tree[walkable.nodeName];
      var children = tree[walkable.childrenName];

      if (_.isEqual(target[walkable.nodeName], node)) {
        target.subNodes = children;
      }

      return true;
    });
    return fecom.async(target);
  };

  describe('walkable', function () {
    describe('DFS', function () {
      it('should return valid nodes', function () {
        expect(walkable.DFS(model)).toEqual(expectedDFSNodes);
      });
    });
    describe('DFS path', function () {
      it('should callback with valid path', function () {
        var paths = [];
        walkable.DFS(model, function (tree, path) {
          paths.push(path.slice());
          return true;
        });
        expect(paths).toEqual(expectedDFSPaths);
      });
    });
    describe('DFSAsync', function () {
      it('should return valid nodes', function (done) {
        walkable.DFSAsync(root, null, getChildren)
          .then(function (nodes) {
            expect(nodes).toEqual(expectedDFSNodes);
            done();
          });
      });
    });
    describe('DFSAsync path', function () {
      it('should callback with valid path', function (done) {
        var paths = [];
        walkable.DFSAsync(root, function (tree, path) {
          paths.push(path.slice());
          return true;
        }, getChildren)
          .then(function () {
            expect(paths).toEqual(expectedDFSPaths);
            done();
          });
      });
    });
    describe('BFS', function () {
      it('should return valid nodes', function () {
        expect(walkable.BFS(model)).toEqual(expectedBFSNodes);
      });
    });
  });

  describe('tree', function () {
    describe('transform', function () {
      it('should return valid map', function () {
        expect(treeModel.transform()).toEqual(expectedMap);
      });
    });
    describe('findPathByNode', function () {
      it('should return valid paths', function () {
        expect(treeModel.findPathByNode({
          name: 'comp_sub_a',
          owner: 'icefox0801'
        })).toEqual(expectedMatchedPaths);
      });
    });
    describe('removeTreeByPath', function () {
      describe('valid path', function () {
        it('should remove sub tree by path', function () {
          var _treeModel = new Tree(model);
          var path = ['icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_a@1.1.0'];
          expect(_treeModel.removeTreeByPath(path)).toEqual(expectedRemovedTree);
          expect(_treeModel.model).toEqual(expectedTreeAfterRemove);
        });
      });
      describe('invalid path', function () {
        it('should not remove sub tree by path', function () {
          var _treeModel = new Tree(model);
          var path = ['icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_a@1.0.0'];
          expect(_treeModel.removeTreeByPath(path)).toEqual({});
          expect(_treeModel.model).toEqual(model);
        });
      });
    });
    describe('updateTreeByPath', function () {
      describe('valid path', function () {
        it('should update sub tree by path', function () {
          var _treeModel = new Tree(model);
          var path = ['icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_a@1.1.0'];
          var props = { resolved: true };
          expect(_treeModel.updateTreeByPath(path, props)).toEqual(expectedUpdatedTree);
          expect(_treeModel.model).toEqual(expectedTreeAfterUpdate);
        });
      });
    });
    describe('updateTreeByPath', function () {
      describe('invalid path', function () {
        it('should not update sub tree by path', function () {
          var _treeModel = new Tree(model);
          var path = ['icefox0801/comp_deps@1.0.0', 'icefox0801/comp_sub_a@1.0.0'];
          var props = { resolved: true };
          expect(_treeModel.updateTreeByPath(path, props)).toEqual({});
          expect(_treeModel.model).toEqual(model);
        });
      });
    });
  });

});