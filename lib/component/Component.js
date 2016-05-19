'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var fse = require('fs-extra');
var jsonfile = require('jsonfile');
var AdmZip = require('adm-zip');

var fecom = require('../fecom');
var gitlabRepo = require('../remote/gitlab');

var Component = function (parsed, type, options) {

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
  this.fresh = true;
  this.confilict = false;
  this.type = type;
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

    if ('local' === self.type) {
      var json = jsonfile.readFileSync(path.join(self.fullPath, 'component.json'));
      self.version = json.version;
      self.author = json.author;
    }

  },

  stringify: function () {
    var self = this;
    return fecom.stringify({
      name: self.name,
      owner: self.owner,
      version: self.version
    });
  },
  getDependencies: function () {
    // Get component dependencies
    var self = this;

    switch (self.type) {
    case 'local':
      return fecom.async([]);
    case 'remote':
      return gitlabRepo.getDependencies(self.owner, self.name, self.version);
    default:
      return fecom.async([]);
    }
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
            return zipEntry.entryName === (extracted[0] + path.sep);
          })) {
          throw new Error('Error occurred in reading extracted files');
        }

        fs.renameSync(path.join(tmpDir, extracted[0]), path.join(tmpDir, self.name));

        if (fs.existsSync(componentDir)) {
          fse.removeSync(componentDir);
        }

        fse.copySync(path.join(tmpDir, self.name), componentDir);

        process.nextTick(function () {
          fse.removeSync(tmpDir);
        });

        return self;
      });
  }
};

module.exports = Component;