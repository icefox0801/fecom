'use strict';

var path = require('path');
var http = require('http');
var https = require('https');
var url = require('url');

var _ = require('lodash');
var fs = require('graceful-fs');
var gitlab = require('gitlab');
var Promise = require('bluebird');
var semver = require('semver');
var ProgressBar = require('progress');

var fecom = require('../fecom');

var GitlabRepo = function () {
  this.gitlab = {};
  this.repo = null;
};

GitlabRepo.prototype = {
  constructor: GitlabRepo,
  initialize: function () {
    var self = this;
    self.gitlab.token = fecom.profile.token;
    self.gitlab = gitlab({
      token: fecom.profile.token,
      url: fecom.config.domain + '/api/v3'
    });
    self.repo = self.gitlab.projects.repository;
  },
  getArchive: function (namespace, projectName, tagName) {
    var archiveUrl = fecom.config.domain + '/' + namespace + '/' + projectName + '/repository/archive.zip?ref=' + tagName + '&private_token=' + fecom.profile.token;
    var prefix = namespace + '/' + projectName + '-' + tagName;
    var archivePath = path.join(fecom.tmpDir, prefix + '-archive.zip');
    archiveUrl = url.parse(archiveUrl);
    var client = ('http:' === archiveUrl.protocol ? http : https);
    var semantic = fecom.stringify({
      name: projectName,
      owner: namespace,
      version: tagName
    });

    return new Promise(function (resolve) {
      // fecom.logger.info('Begin to download ' + specified);
      // fecom.logger.info(archiveUrl.href);
      var req = client.request(archiveUrl);
      req.end();
      req.on('response', function (res) {
        var dirname = path.join(fecom.tmpDir, namespace);
        var contentLength = res.headers['content-length'] >> 0;
        var bar = new ProgressBar(fecom.i18n('DOWNLOADING_COMPONENT', semantic), {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: contentLength
        });

        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname);
        }

        var stream = fs.createWriteStream(archivePath);
        res.on('data', function (chunk) {
          bar.tick(chunk.length);
          stream.write(chunk);
        });
        res.on('end', function () {
          stream.on('finish', function () {
            // fecom.logger.info('Finish downloading ' + prefix);
            resolve(archivePath);
          });
          stream.end();
        });
      });
    });

  },
  validate: function (namespace, projectName, version) {
    var self = this;
    var latestTag = '';
    var promise = version ? fecom.async(version) : self.getLatestTag(namespace, projectName).then(function (tag) { return tag.name; });

    return promise
      .then(function (tagName) {
        latestTag = tagName;
        return self.getComponentJson(namespace, projectName, tagName);
      })
      .then(function (json) {

        if (json.version !== latestTag) {
          return null;
        }

        return json;
      });
  },
  getDependencies: function (namespace, projectName, version, json) {
    // Get dependencies
    var node = {};

    json.dependencies = json.dependencies || [];
    version = version || json.version;
    node.name = fecom.stringify({
      name: projectName,
      owner: namespace,
      version: version
    });
    node.dependencies = json.dependencies.map(function (specified) {
      return fecom.stringify(fecom.parse(specified));
    });

    return fecom.async(node);
  },
  getLatestTag: function (namespace, projectName) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var projectId = namespace + '/' + projectName;
      self.repo.listTags(projectId, function (tags) {
        var latest = {};

        if (!tags) {
          reject(new Error('Repository not found'));
          return false;
        }

        if (tags && !tags.length) {
          reject(new Error('Component tags not found in ' + projectId));
          return false;
        }

        latest = _(tags).sortBy('commit.committed_date').last();

        return resolve(latest);
      });
    });
  },
  getComponentJson: function (namespace, projectName, tagName) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var projectId = namespace + '/' + projectName;
      self.repo.showFile({
        projectId: projectId,
        ref: 'tags/' + tagName,
        file_path: 'component.json'
      }, function (file) {
        var content, json;

        if (!file) {
          reject(new Error('"component.json" not found in ' + projectId));
          return false;
        }

        content = (new Buffer(file.content, 'base64')).toString();

        json = JSON.parse(content);

        resolve(json);
      });
    });
  }
};

module.exports = new GitlabRepo();