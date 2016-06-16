'use strict';

var path = require('path');

var fs = require('graceful-fs');
var Git = require('nodegit');
var semver = require('semver');
var jsonfile = require('jsonfile');
var inquirer = require('inquirer');

var fecom = require('./fecom');

module.exports = function (releaseType, options) {
  var rootDir = fecom.root; // Root directory
  var componentJson;
  var json = fecom.config;
  var repo;
  var version = fecom.config.version || '0.0.0';
  var nextVersion;
  var publishedBefore = true;
  var questions = [{
    name: 'releaseType',
    message: 'Please choose a release type: ',
    type: 'list',
    choices: ['patch', 'minor', 'major']
  }];

  return Git.Repository.openExt(path.resolve(fecom.root), 0, '')
    .then(function (repoResult) {
      repo = repoResult;
      rootDir = repo.workdir();
      componentJson = path.join(rootDir, 'component.json');

      if (!fs.existsSync(componentJson)) {
        throw new Error('Missing "component.json"');
      }

      return Git.Tag.list(repo);
    })
    .then(function (tags) {

      if (!tags.length) { // If not published before
        fecom.logger.info('No version published before!');
        publishedBefore = false;
      } else { // If published before, increase by this
        tags = tags.sort(function (a, b) {
          return semver.compare(a, b);
        });

        // If versions in component.json and tag mismatch
        if (version !== tags.pop()) {
          throw new Error('Component version and the latest tag does not match!');
        }

        fecom.logger.info(fecom.i18n('CURRENT_VERSION', version));
      }

      return repo.getStatus();
    })
    .then(function (statusList) {
      // If modification uncommitted
      if (statusList.length > 0) {
        throw new Error('Please commit local change first!');
      }
    })
    .then(function () {
      return releaseType
        ? fecom.async(releaseType)
        : inquirer.prompt(questions)
          .then(function (answers) {
            return answers.releaseType;
          });
    })
    .then(function (releaseType) {

      if (publishedBefore) {
        nextVersion = semver.inc(version, releaseType);
      } else {

        if ('0.0.0' === version) { // If version 0.0.0, increase by this
          nextVersion = semver.inc(version, releaseType);
        } else { // If version not 0.0.0, use this as default
          nextVersion = version;
        }

      }

    })
    .then(function () {
      var message = [{
        name: 'comment',
        message: 'Please leave a release message: ',
        type: 'input',
        validate: function (value) {
          var isValid = value.match(/^.{4,50}$/i);
          return isValid ? true : 'Invalid comment';
        }
      }];

      return inquirer.prompt(message);
    })
    .then(function (answers) {
      // 如果component.json中的版本号发生更改，写到json中
      if (nextVersion !== version) {
        json.version = nextVersion;
        jsonfile.writeFileSync(componentJson, json, { spaces: 2 });
      }
      // 提交component.json改动并新增Tag
      var author = Git.Signature.default(repo);
      var committer = Git.Signature.default(repo);

      return repo.createCommitOnHead(['component.json'], author, committer, 'v' + nextVersion)
        .then(function (oid) {
          fecom.logger.info("New Commit: " + oid.toString());
          return repo.createTag(oid, nextVersion, answers.comment);
        })
        .then(function (tag) {
          fecom.logger.info("New Version: " + nextVersion);
          fecom.logger.info("Release message: " + answers.comment);
        });

    })
    .catch(fecom.errorHandler);

};