'use strict';

module.exports = [{
  name: 'username',
  message: 'Please enter username: ',
  type: 'input',
  validate: function (value) {
    var isValid = value.match(/^[a-zA-Z][0-9a-zA-Z\-]+$/i);
    return isValid ? true : 'Invalid username';
  }
}, {
  name: 'email',
  message: 'Please enter your email: ',
  type: 'input',
  validate: function (value) {
    var isValid = value.match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i);
    return isValid ? true : 'Invalid email address';
  }
}, {
  name: 'token',
  message: 'Please enter your Gitlab token: ',
  type: 'password',
  validate: function (value) {
    var isValid = value.match(/^[\-_0-9a-zA-Z]{20}([\-_0-9a-zA-Z]{20})?$/i);
    return isValid ? true : 'Invalid Gitlab token';
  }
}];