'use strict';

var path = require('path');

var _ = require('lodash');
var fs = require('graceful-fs');
var gitlab = require('gitlab');
var Promise = require('bluebird');
var semver = require('semver');
var rp = require('request-promise');

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
    var url = fecom.config.domain + '/' + namespace + '/' + projectName + '/repository/archive.zip?ref=' + tagName + '&private_token=' + fecom.profile.token;
    return rp.get({
      url: url
    });
  },
  validate: function (namespace, projectName, version) {
    var self = this;
    var latestTag = '';
    var promise = version ? fecom.async(version) : self.getLatestTag(namespace, projectName);

    return promise
      .then(function (tagName) {
        latestTag = tagName;
        return self.getComponentJson(namespace, projectName, tagName);
      })
      .then(function (json) {

        if (json.version !== latestTag) {
          return null;
        }

        return json.version;
      });
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

        return resolve(latest.name);
      });
    });
  },
  getComponentJson: function (namespace, projectName, tag) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var projectId = namespace + '/' + projectName;
      self.repo.showFile({
        projectId: projectId,
        ref: 'tags/' + tag,
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