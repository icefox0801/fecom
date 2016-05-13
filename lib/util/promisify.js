'use strict';

var Promise = require('bluebird');

var func = function (params, callback) {
  return callback(null, params);
};

module.exports = Promise.promisify(func);