'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var fse = require('fs-extra');
var glob = require('glob');
var minimatch = require('minimatch');
var semver = require('semver');
var jsonfile = require('jsonfile');
var AdmZip = require('adm-zip');

var fecom = require('../fecom');
var Tree = require('./Tree');
var gitlabRepo = require('../remote/gitlab');

var Component = function (parsed, type, options) {

  if ('root' === type) {
    parsed = {
      name: fecom.config.name,
      owner: fecom.profile.username,
      version: fecom.config.version
    };
  }

  if (!parsed.hasOwnProperty('name')) {
    throw new Error('Component name must be defined');
  }

  if (!parsed.hasOwnProperty('owner')) {
    throw new Error('Component owner must be defined');
  }

  this.name = parsed.name;
  this.owner = parsed.owner;
  this.version = parsed.version || '';
  this.author = '';

  this.specified = !!parsed.specified;
  this.conflict = !!parsed.conflict;
  this.isInstalled = !!parsed.isInstalled;
  this.resolved = !!parsed.resolved;
  this.status = parsed.status || '';
  this.hasUpdate = false;
  this.newestVersion = '';

  this.type = type;
  this.tree = null;
  this.exclude = [];
  this.fullPath = path.join(fecom.componentRoot, parsed.name);
  this.options = _.assign({}, Component.defaults, options);
  this.initialize();
};

Component.defaults = {};

Component.prototype = {
  constructor: Component,
  initialize: function () {
    // Initializing a component
    var self = this;
    var model = {
      props: {
        name: self.name,
        owner: self.owner,
        version: self.version
      }
    };

    model.subNodes = [];

    if (self.options.children && self.options.children.length) {
      model.subNodes = self.options.children.slice();
    }

    if ('local' === self.type) {
      var json = jsonfile.readFileSync(path.join(self.fullPath, 'component.json'));
      self.version = json.version;
      self.author = json.author;
      self.exclude = json.exclude || [];
    }

    self.tree = new Tree(model);

  },

  stringify: function (hideStatus) {
    var self = this;
    return fecom.stringify({
      name: self.name,
      owner: self.owner,
      version: self.version,
      status: hideStatus ? '' : self.status
    });
  },

  getLocalDependenciesTree: function (callback) {
    // Get component dependencies via local
    var self = this;

    function getDependencies(parsed) {
      var componentJson = path.join(fecom.config.dir, parsed.name, 'component.json');
      var tree = {};
      var json, dependenciesMap;

      if (!fs.existsSync(componentJson)) {
        throw new Error('Missing component.json');
      }

      json = jsonfile.readFileSync(componentJson);
      dependenciesMap = json.dependencies || [];
      tree.props = _.assign({}, parsed, {
        name: json.name,
        version: json.version
      });
      tree.subNodes = dependenciesMap.map(function (semantic) {
        var subParsed = fecom.parse(semantic);
        var subComponentJson = path.join(fecom.config.dir, subParsed.name, 'component.json');

        if (!fs.existsSync(subComponentJson)) {
          throw new Error('Missing component.json');
        }

        json = jsonfile.readFileSync(subComponentJson);

        if (subParsed.version && (subParsed.version !== json.version)) {
          subParsed.status = ('expected: ' + subParsed.version).yellow;
        }

        subParsed.version = json.version;

        return {
          props: subParsed
        };
      });
      return tree;
    }

    var getChildren = function (tree) {
      var parsed = tree.props;
      var isRoot = (parsed.name === fecom.config.name && parsed.owner === fecom.profile.username);
      if (isRoot && !tree.subNodes.length) {
        return fecom.async(tree);
      }

      var dependenciesTree = getDependencies(parsed);
      tree.props = dependenciesTree.props;
      tree.subNodes = dependenciesTree.subNodes;

      return fecom.async(tree);
    };

    return self.tree.walkAsync('DFS', callback, getChildren)
      .then(function () {
        return self.tree.model;
      });
  },

  getRemoteDependenciesTree: function (callback) {
    // Get component dependencies via remote
    var self = this;

    var getChildren = function (tree) {
      var parsed = tree.props;
      var isRoot = (parsed.name === fecom.config.name && parsed.owner === fecom.profile.username);

      if (isRoot && !tree.subNodes.length) {
        return fecom.async(tree);
      }

      return gitlabRepo.validate(parsed.owner, parsed.name, parsed.version)
        .then(function (json) {
          return gitlabRepo.getDependencies(parsed.owner, parsed.name, parsed.version, json)
            .then(function (map) {
              tree.props = fecom.parse(map.name);
              tree.subNodes = map.dependencies.map(function (semantic) {
                return {
                  props: fecom.parse(semantic)
                };
              });

              return tree;
            });
        });
    };

    return self.tree.walkAsync('DFS', callback, getChildren)
      .then(function () {
        return self.tree.model;
      });
  },

  checkUpdate: function () {
    var self = this;
    return gitlabRepo.getLatestTag(self.owner, self.name)
      .then(function (tag) {

        if (semver.gt(tag.name, self.version)) {
          self.hasUpdate = true;
          self.newestVersion = tag.name;
        }

        return self;
      });
  },

  validate: function () {
    // Validate installed component
    var self = this;
    return true;
  },
  install: function () {
    // Install component
    var self = this;
    var prefix = self.owner + '/' + self.name + '-' + self.version;
    var archivePath = path.join(fecom.tmpDir, prefix + '-archive.zip');
    var promise = fs.existsSync(archivePath) ?
        fecom.async(archivePath) :
        gitlabRepo.getArchive(self.owner, self.name, self.version);

    return promise
      .then(function (filePath) {
        var zip = new AdmZip(filePath);
        var tmpDir = path.join(fecom.tmpDir, '.tmp' + Date.now());
        var componentDir = path.join(fecom.componentRoot, self.name);

        if (!fs.existsSync(fecom.componentRoot)) {
          fs.mkdirSync(fecom.componentRoot);
        }

        fs.mkdirSync(tmpDir);
        zip.extractAllTo(tmpDir);

        var zipEntries = zip.getEntries();
        var extracted = fs.readdirSync(tmpDir);

        if (!zipEntries.some(function (zipEntry) {
            // In windows and linux, zip entry both use "/" as separators
            return zipEntry.entryName === (extracted[0] + '/');
          })) {
          throw new Error(fecom.i18n('READING_EXTRACTED_FILE_ERROR'));
        }

        fs.renameSync(path.join(tmpDir, extracted[0]), path.join(tmpDir, self.name));

        if (fs.existsSync(componentDir)) {
          fse.removeSync(componentDir);
        }
        // Exclude files and directories
        var componentJson = path.join(tmpDir, self.name, 'component.json');
        var json = {};

        if (fs.existsSync(componentJson)) {
          json = jsonfile.readFileSync(componentJson);
        }

        self.exclude = json.exclude || [];

        var files = [];

        if (self.exclude.length) {
          self.exclude.forEach(function (pattern) {
            var patternPath = path.join(tmpDir, self.name, pattern);

            if (!glob.hasMagic(pattern)) {

              if (fs.existsSync(patternPath) && fs.lstatSync(patternPath).isDirectory()) {
                files = files.concat(glob.sync(pattern, { cwd: path.join(tmpDir, self.name) }));
                pattern += '/**/*';
              }

            }

            files = files.concat(glob.sync(pattern, { cwd: path.join(tmpDir, self.name) }));
          });
        }

        files = files.map(function (file) {
          return path.join(tmpDir, self.name, file);
        });

        fse.copySync(path.join(tmpDir, self.name), componentDir, {
          filter: function (file) {
            var isMatch;

            if (files.indexOf(file) > -1) {
              isMatch = true;
            }
            return !isMatch;
          }
        });

        process.nextTick(function () {
          fse.removeSync(tmpDir);
        });

        return self;
      });
  }
};

module.exports = Component;