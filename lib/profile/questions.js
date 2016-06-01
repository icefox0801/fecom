'use strict';

var fecom = require('../fecom');

module.exports = [{
  name: 'username',
  message: fecom.i18n('ENTER_USERNAME'),
  type: 'input',
  validate: function (value) {
    var isValid = value.match(/^[a-zA-Z][0-9a-zA-Z\-]+$/i);
    return isValid ? true : 'Invalid username';
  }
}, {
  name: 'email',
  message: fecom.i18n('ENTER_EMAIL'),
  type: 'input',
  validate: function (value) {
    var isValid = value.match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
    return isValid ? true : 'Invalid email address';
  }
}, {
  name: 'token',
  message: fecom.i18n('ENTER_TOKEN'),
  type: 'password',
  validate: function (value) {
    var isValid = value.match(/^[\-_0-9a-zA-Z]{20}([\-_0-9a-zA-Z]{20})?$/i);
    return isValid ? true : 'Invalid Gitlab token';
  }
}];