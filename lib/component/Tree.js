'use strict';

var _ = require('lodash');
var fecom = require('../fecom');
var treeify = require('treeify');

var walkable = {
  nodeName: 'props',
  childrenName: 'subNodes',
  BFS: function (tree, callback) {
    // Breadth First Search
  },
  DFS: function (tree, callback) {
    // Depth First Search
    var nodes = [];
    function iterate (tree) {
      var node = tree[walkable.nodeName];
      var children = tree[walkable.childrenName];

      if ('function' === callback && !callback.call(null, node, tree)) {
        return false;
      }

      nodes.push(node);
      children.forEach(function (subTree) {
        iterate(subTree);
      });
      return true;
    }

    iterate(tree, callback);
    return nodes;
  }
};

/**
 * @description Tree
 * @param model
 * @constructor
 */
var Tree = function (model) {
  this.model = model;
};

Tree.walkable = walkable;

Tree.prototype = {
  constructor: Tree,
  walk: function (strategy, callback) {
    var self = this;
    self.data();
  },
  getAllNodes: function () {
    // Get all nodes of tree
    var self = this;
    return walkable.DFS(self.model);
  },
  transform: function () {
    // Transform tree to nice printed object
    var self = this;
    var transformNode = function (map, node) {
      var specified = fecom.stringify(node.props);
      var subMap = {};
      node.subNodes.forEach(function (subNode) {
        transformNode(subMap, subNode);
      });
      map[specified] = subMap;
      return map;
    };
    return transformNode({}, self.model);
  }
};

module.exports = Tree;
