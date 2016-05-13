'use strict';

var path = require('path');

var _ = require('lodash');
var inquirer = require('inquirer');

var i18n = require('../i18n');
var logger = require('./util/logger');
var getQuestions = require('./component/getQuestions');
var initComponent = require('./component/initComponent');
var initPackage = require('./component/package');
var promisify = require('./util/promisify');

module.exports = function (options) {
  // Get questions to be asked
  getQuestions(options)
    .then(function (questions) {
      var defaultKeys, defaultValues, defaultAnswers = {};

      if (options.skip) {
        defaultKeys = _.map(questions, 'name');
        defaultValues = _.map(questions, 'default');
        defaultAnswers = _.zipObject(defaultKeys, defaultValues);
        return promisify(defaultAnswers);
      }

      logger.info(i18n('CONFIGURING_COMPONENT_JSON'));
      return inquirer.prompt(questions);
    })
    .then(function (answers) {
      return initComponent(answers, options)
        .then(function (config) {
          logger.info(i18n('FINISH_CONFIGURING_COMPONENT_JSON'));
          return config;
        })
        .then(function (config) {
          initPackage(config, options);
          logger.info(i18n('CREATE_PACKAGE_JSON'));
        });
    })
    .then(function () {
      logger.info(i18n('FINISH_INITIALIZING_COMPONENT'));
    });
};