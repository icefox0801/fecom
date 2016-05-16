'use strict';

var _ = require('lodash');
var gitlab = require('gitlab');
var Promise = require('bluebird');
var semver = require('semver');

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
      token: '4zWuy_my-jMuSnjLSkKv',
      url: 'http://gitlab.com/api/v3'
    });
    //self.gitlab = gitlab({
    //  token: fecom.profile.token,
    //  url: 'http://gitlab.58corp.com/api/v3'
    //});
    self.repo = self.gitlab.projects.repository;
  },
  validate: function (namespace, projectName) {
    var self = this;
    var latestTag = '';
    return self.getLatestTag(namespace, projectName)
      .then(function (tagName) {
        latestTag = tagName;
        return self.getComponentVersion(namespace, projectName, tagName);
      })
      .then(function (version) {

        if (version !== latestTag) {
          throw new Error('Component version and tag not match');
        }

        return version;
      });

  },
  getRepository: function (namespace, projectName) {
    var self = this;
    return new Promise(function (resolve, reject) {

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
  getComponentVersion: function (namespace, projectName, tag) {
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

        resolve(json.version);
      });
    });
  }
};

module.exports = new GitlabRepo();