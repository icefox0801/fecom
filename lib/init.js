'use strict';

var _ = require('lodash');
var inquirer = require('inquirer');

var logger = require('./util/logger');
var getQuestions = require('./component/getQuestions');
var initComponent = require('./component/initComponent');
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

      logger.info('Initializing component.json');
      return inquirer.prompt(questions);
    })
    .then(function (answers) {
      initComponent(answers, options);
    });
};