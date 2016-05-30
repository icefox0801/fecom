'use strict';

module.exports = function (str) {
  var regex = /^(([a-zA-Z][_\-0-9a-zA-Z]*)\/)?([a-zA-Z][_\-0-9a-zA-Z]*)(@(\d+\.\d+\.\d+))?$/i;
  var parsed = {};
  var match = regex.exec(str);

  if (!match) {
    throw new Error('Component cannot be parsed');
  }

  if (match[2]) {
    parsed.owner = match[2];
  }

  parsed.name = match[3] || '';

  if (match[5]) {
    parsed.version = match[5];
  }


  return parsed;
};