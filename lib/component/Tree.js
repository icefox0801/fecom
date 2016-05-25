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
    var paths = [];
    var node = tree[walkable.nodeName];
    var children = tree[walkable.childrenName];
    nodes.push(node);
    paths.push(fecom.stringify(_.omit(node, 'status')));

    function iterate(children) {

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
  BFSAsync: function (tree, callback) {
    // Breadth First Search Async
    var nodes = [];
    var paths = [];

    function iterateAsync() {

    }

    return iterateAsync(tree);
  },
  DFS: function (tree, callback) {
    // Depth First Search
    var nodes = [];
    var paths = [];
    function iterate(tree) {
      var node = tree[walkable.nodeName];
      var children = tree[walkable.childrenName] || [];
      nodes.push(node);
      paths.push(fecom.stringify(_.omit(node, 'status')));

      if ('function' === typeof callback && !callback.call(null, tree, paths)) {
        paths.pop();
        return false;
      }

      children.forEach(function (subTree) {
        iterate(subTree);
      });
      paths.pop();
      return true;
    }

    iterate(tree, callback);
    return nodes;
  },
  DFSAsync: function (tree, callback, getChildren) {
    // Depth First Search Async
    var nodes = [];
    var paths = [];

    function iterateAsync(tree) {
      var subNodes = tree[walkable.childrenName];
      var promise = subNodes && subNodes.length ? fecom.async(tree) : getChildren(tree);

      return promise
        .then(function (filledTree) {
          var filledSubNodes = filledTree.subNodes;
          nodes.push(filledTree.props);
          paths.push(fecom.stringify(_.omit(filledTree.props, 'status')));

          if ('function' === typeof callback && !callback.call(null, filledTree, paths)) {
            paths.pop();
            return fecom.async(nodes);
          }

          return Promise
            .reduce(filledSubNodes, function (nodes, filledSubTree) {
              return iterateAsync(filledSubTree)
                .then(function () {
                  return nodes;
                });
            }, []);
        })
        .then(function () {
          paths.pop();
          return nodes;
        });
    }

    return iterateAsync(tree);
  }
};

/**
 * @description Tree
 * @param model
 * @constructor
 */
var Tree = function (model) {
  this.model = _.cloneDeep(model);
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

  getPathByNode: function (node) {
    var self = this;
    var paths = [];
    walkable.DFS(self.model, function (tree, path) {

      if (_.isMatch(tree.props, node)) {
        paths.push(path.slice());
      }

      return true;
    });

    return paths;
  },
  updateTreeByPath: function (path, props) {
    var self = this;
    var nodes = path.map(function (subPath) {
      return fecom.parse(subPath);
    });
    return nodes.reduce(function (tree, node, idx) {
      var isValid, children, matched;

      if (0 === idx) {
        isValid = _.isMatch(tree.props, node);

        if (isValid) {
          return tree;
        }

        return {};
      }

      children = tree.subNodes || [];
      matched = _.find(children, { props: _.omit(node, ['status']) }) || {};

      if (nodes.length - 1 === idx && !_.isEmpty(matched)) {
        matched.props = _.assign({}, matched.props, props);
      }

      return matched;
    }, self.model);
  },
  removeTreeByPath: function (path) {
    var self = this;
    var nodes = path.map(function (subPath) {
      return fecom.parse(subPath);
    });
    return nodes.reduce(function (tree, node, idx) {
      var isValid, children, matched;

      if (0 === idx) {
        isValid = _.isMatch(tree.props, node);

        if (isValid) {
          return tree;
        }

        return {};
      }

      children = tree.subNodes || [];
      matched = _.find(children, { props: _.omit(node, ['status']) }) || {};

      if (nodes.length - 1 === idx && !_.isEmpty(matched)) {
        tree.subNodes = _.reject(tree.subNodes, matched);
      }

      return matched;
    }, self.model);
  },
  transform: function () {
    // Transform tree to nice printed object
    var self = this;
    var transformNode = function (map, tree) {
      var semantic = fecom.stringify(tree.props);
      var subMap = {};
      var subNodes = tree.subNodes || [];

      subNodes.forEach(function (subNode) {
        transformNode(subMap, subNode);
      });

      map[semantic] = subMap;
      return map;
    };
    return transformNode({}, self.model);
  }
};

module.exports = Tree;
