'use strict';

var Promise = require('bluebird');
var config = require('./component/getConfig');
var getConfig = Promise.promisify(config);

module.exports = function (options) {

};