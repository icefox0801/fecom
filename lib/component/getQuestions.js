'use strict';

var semver = require('semver');
var getDefault = require('./getDefault');

module.exports = function (options) {
  return getDefault(options)
    .then(function (defaults) {
      return [{
        name: 'name',
        type: 'input',
        message: 'name: ',
        default: defaults.name,
        validate: function (value) {
          var isValid = value.match(/^[a-zA-Z][_\-0-9a-zA-Z]+$/i);
          return isValid ? true : 'Invalid component name';
        }
      }, {
        name: 'version',
        type: 'input',
        message: 'version: ',
        default: '1.0.0',
        validate: function (value) {
          var isValid = semver.valid(value);
          return isValid ? true : 'Invalid version number';
        }
      }, {
        name: 'description',
        type: 'input',
        message: 'description: ',
        default: 'A magic component',
        validate: function (value) {
          var isValid = value.match(/^[\s\S]{4,120}$/i);
          return isValid ? true : 'Description should be between 4 and 120 characters';
        }
      }, {
        name: 'main',
        type: 'input',
        message: 'main :',
        default: 'index.js'
      }, {
        name: 'author',
        type: 'input',
        message: 'author: ',
        default: defaults.username + (defaults.email ? '<' + defaults.email + '>' : ''),
        validate: function (value) {
          var matches = value.match(/^([a-zA-Z][0-9a-zA-Z\-]+)(<(\S+)>)?$/);
          var username = matches[1];
          var email = matches[3];
          var isValid = username && (!email || email.match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i));

          return isValid ? true : 'Invalid author';
        }
      }];
    });
};