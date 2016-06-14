'use strict';

var Spinner = require('cli-spinner').Spinner;

var fecom = require('./fecom');
var gitlabRepo = require('./remote/gitlab');

module.exports = function (pattern, options) {

  var spinner = new Spinner(fecom.i18n('SEARCHING_COMPONENTS'));
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  return gitlabRepo.searchComponents(pattern, options)
    .then(function (results) {
      var lines = results.map(function (result) {
        return (options.semantic ? fecom.stringify(result) : result.name) + ': ' + result.description;
      }).join('\n');

      if (!lines) {
        lines = fecom.i18n('NO_MATCHED_RESULTS');
      }

      spinner.stop(true);
      fecom.logger.info(fecom.i18n('SEARCH_RESULTS', lines));
    })
    .catch(function (err) {
      spinner.stop(true);
      fecom.errorHandler(err);
      return {};
    });

};