'use strict';

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
              version: '1.0.1'
            },
            subNodes: []
          }
        ]
      }
    ]
  };
  var expectedMap = {
    'icefox0801/comp_deps@1.0.0': {
      'icefox0801/comp_sub_a@1.1.0': {},
      'icefox0801/comp_sub_b@1.0.1': {
        'icefox0801/comp_sub_a@1.0.1': {}
      }
    }
  };
  var expectedNodes = [
    {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.1.0'
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
    }
  ];
  var treeModel = new Tree(model);

  describe('walkable', function () {
    describe('DFS', function () {
      it('should return valid nodes', function () {
        expect(walkable.DFS(model)).toEqual(expectedNodes);
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