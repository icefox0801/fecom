'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var fse = require('fs-extra');
var glob = require('glob');
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
  this.args = parsed.args || '';
  this.script = '';
  this.main = '';

  this.specified = !!parsed.specified;
  this.conflict = !!parsed.conflict;
  this.installed = !!parsed.installed;
  this.merged = !!parsed.merged;
  this.resolved = !!parsed.resolved;
  this.status = parsed.status || '';
  this.hasUpdate = false;
  this.latest = '';

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
      self.main = json.main || 'index.js';
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

    function getDependencies(parsed, isRoot) {
      var componentDir = isRoot ? path.join(fecom.root) : path.join(fecom.componentRoot, parsed.name);
      var componentJson = path.join(componentDir, 'component.json');
      var tree = {};
      var json, dependenciesMap;

      if (!fs.existsSync(componentDir)) {
        tree.props = parsed;
        tree.subNodes = [];
        return tree;
      }

      if (!fs.existsSync(componentJson)) {
        throw new Error('Missing component.json');
      }

      json = jsonfile.readFileSync(componentJson);
      dependenciesMap = json.dependencies || [];
      tree.props = _.assign({}, parsed, {
        name: json.name,
        version: json.version
      });

      dependenciesMap = dependenciesMap.filter(function (semantic) {
        var subParsed = fecom.parse(semantic);
        return !(subParsed.hasOwnProperty('resolved') && subParsed.resolved);
      });

      tree.subNodes = dependenciesMap.map(function (semantic) {
        var subParsed = fecom.parse(semantic);
        var subComponentJson = path.join(fecom.componentRoot, subParsed.name, 'component.json');

        if (!fs.existsSync(subComponentJson)) {
          // Missing component.json
          if (isRoot) {
            return null;
          }

          throw new Error(fecom.i18n('COMPONENT_NOT_INSTALLED', subParsed.owner + '/' + subParsed.name));
        }

        if (isRoot) {
          subParsed.specified = true;
        }

        json = jsonfile.readFileSync(subComponentJson);

        if (subParsed.version && (subParsed.version !== json.version)) {
          subParsed.status = ('expected: ' + subParsed.version).yellow;
        }

        subParsed.version = json.version;
        subParsed.installed = true;

        return {
          props: subParsed
        };
      });

      tree.subNodes = tree.subNodes.filter(function (node) {
        return node;
      });

      return tree;
    }

    var getChildren = function (tree) {
      var parsed = tree.props;
      var isRoot = (parsed.name === fecom.config.name && parsed.owner === fecom.profile.username);
      var dependenciesTree = getDependencies(parsed, isRoot);
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

      return gitlabRepo.getDependencies(parsed.owner, parsed.name, parsed.version)
        .then(function (map) {
          tree.props = _.assign({}, tree.props, fecom.parse(map.name));
          tree.subNodes = map.dependencies.map(function (semantic) {
            return {
              props: fecom.parse(semantic)
            };
          });

          return tree;
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
          self.latest = tag.name;
        }

        self.status = self.hasUpdate ? self.latest.yellow : fecom.i18n('NO_UPDATE_AVAILABLE');
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
    var prefix = '';
    var archivePath = '';

    if (self.hasUpdate) {
      self.version = self.latest;
    }

    prefix = self.owner + '/' + self.name + '-' + self.version;
    archivePath = path.join(fecom.tmpDir, prefix + '-archive.zip');

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
        self.script = json.script || '';

        if (self.script) {
          return self.executeScript(tmpDir)
            .then(function () {
              return tmpDir;
            });
        }

        return tmpDir;
      })
      .then(function (tmpDir) {
        var files = [];
        var componentDir = path.join(fecom.componentRoot, self.name);

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
  },
  uninstall: function () {
    // Uninstall component
    var self = this;
    var dir = self.fullPath;

    if (!self.installed) {
      return fecom.async(self);
    }

    if (!fs.existsSync(dir)) {
      throw new Error(fecom.i18n('COMPONENT_DIR_NOT_EXISTS', self.name));
    }

    fse.removeSync(dir);

    self.installed = false;
    return fecom.async(self);
  },
  executeScript: function (tmpDir) {
    var self = this;
    var exec = require('child_process').exec;

    return new Promise(function (resolve) {
      exec(self.script, {
        cwd: path.join(tmpDir, self.name)
      }, function (err, stdout, stderr) {

        if (err) {
          throw new Error('Error occurred');
        }

        if (stderr) {
          throw new Error('Error occurred');
        }

        if (stdout) {
          fecom.logger.info(stdout);
        }

        resolve();
      });
    });

  },
  getInformation: function () {
    var self = this;
    var result = {};

    return gitlabRepo.validate(self.owner, self.name)
      .then(function (json) {
        result.info = {};
        result.info.name = self.name;
        result.info.owner = self.owner;
        result.info.description = json.description || '';
        result.info.author = json.author || '';
        result.info.version = json.version;
        return gitlabRepo.getAllTags(self.owner, self.name);
      })
      .then(function (tags) {
        result.versions = tags;
        return result;
      });
  }
};

module.exports = Component;