'use strict';

var _ = require('lodash');

module.exports = function (newParsedList, oldParsedList) {
  var dependencies = _.unionWith(newParsedList, oldParsedList, function (newParsed, oldParsed) {
    var isMatch = _.isMatch(newParsed, _.pick(oldParsed, ['name', 'owner']));

    if (isMatch) {

      if (newParsed.resolved) {
        newParsed.resolved = false;
      }

      if (oldParsed.specified) {
        newParsed.specified = true;
      }

      return true;
    }
  });

  dependencies = dependencies.filter(function (parsed) {
    return parsed.resolved || parsed.specified;
  });

  return dependencies;
};