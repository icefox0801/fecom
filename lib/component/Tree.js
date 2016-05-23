'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var treeify = require('treeify');

var fecom = require('../fecom');

var walkable = {
  nodeName: 'props',
  childrenName: 'subNodes',
  BFS: function (tree, callback) {
    // Breadth First Search
    var nodes = [];
    var node = tree[walkable.nodeName];
    var children = tree[walkable.childrenName];
    nodes.push(node);

    function iterate (children) {

      children = children.filter(function (subTree) {
        var subNode = subTree[walkable.nodeName];
        var subChildren = subTree[walkable.childrenName];
        return !('function' === callback && !callback.call(null, subNode, subChildren));
      });

      nodes = nodes.concat(children.map(function (subTree) {
        return subTree.props;
      }));

      var grandChildren = children.reduce(function (a, b) {
        var subAChildren = a[walkable.childrenName];
        var subBChildren = b[walkable.childrenName];
        return subAChildren.concat(subBChildren);
      });

      if (grandChildren.length) {
        iterate(grandChildren);
        return true;
      }

      return false;
    }

    iterate(children);
    return nodes;
  },
  DFS: function (tree, callback) {
    // Depth First Search
    var nodes = [];
    function iterate(tree) {
      var node = tree[walkable.nodeName];
      var children = tree[walkable.childrenName] || [];

      if ('function' === typeof callback && !callback.call(null, node, children)) {
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
  },
  DFSAsync: function (tree, callback, getChildren) {
    // Depth First Search Async

    function iterateAsync(tree) {
      var nodes = [];
      var node = tree[walkable.nodeName];
      var children = tree[walkable.childrenName];

      if ('function' === typeof callback && !callback.call(null, node, children)) {
        return fecom.async(nodes);
      }

      nodes.push(node);

      return getChildren(tree)
        .then(function (subTrees) {
          tree[walkable.childrenName] = subTrees;
          return Promise
            .reduce(subTrees, function (subNodes, subTree) {
              return iterateAsync(subTree)
                .then(function (grandTrees) {
                  subNodes = subNodes.concat(grandTrees);
                  return subNodes;
                });
            }, nodes);
        })
        .then(function (nodes) {
          return nodes;
        });
    }

    return iterateAsync(tree)
      .then(function (subNodes) {
        return subNodes;
      });
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

    if ('function' !== typeof walkable[strategy]) {
      throw new Error('Expected function');
    }

    return walkable[strategy](self.model, callback);
  },
  walkAsync: function (strategy, callback, getChildren) {
    var self = this;
    strategy = strategy + 'Async';

    if ('function' !== typeof walkable[strategy]) {
      throw new Error('Expected function');
    }

    return walkable[strategy](self.model, callback, getChildren);
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
      var subNodes = node.subNOdes || [];

      subNodes.forEach(function (subNode) {
        transformNode(subMap, subNode);
      });

      map[specified] = subMap;
      return map;
    };
    return transformNode({}, self.model);
  }
};

module.exports = Tree;
