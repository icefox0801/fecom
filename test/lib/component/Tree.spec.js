'use strict';

var _ = require('lodash');
var fecom = require('../../../lib/fecom');
var Tree = require('../../../lib/component/Tree');
var walkable = Tree.walkable;

describe('component Tree', function () {
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
  var treeModel = new Tree(model);
  var getChildren = function (target) {
    var match = [];
    treeModel.walk('DFS', function (node, children) {

      if (_.isEqual(target.props, node)) {
        match = children;
      }

      return true;
    });
    return fecom.async(match.map(function (subTree) {
      return {
        props: subTree.props
      };
    }));
  };

  describe('walkable', function () {
    describe('DFS', function () {
      it('should return valid nodes', function () {
        expect(walkable.DFS(model)).toEqual(expectedDFSNodes);
      });
    });
  });

  describe('walkable', function () {
    describe('DFSAsync', function () {
      it('should return valid nodes', function (done) {
        walkable.DFSAsync(root, null, getChildren)
          .then(function (nodes) {
            expect(nodes).toEqual(expectedDFSNodes);
            done();
          });
      });
    });
  });

  describe('walkable', function () {
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
  });

});