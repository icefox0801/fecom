'use strict';

var fecom = require('../../../lib/fecom');
var getInstalled = require('../../../lib/component/getInstalled');
var getToInstall = require('../../../lib/component/getToInstall');
var analyze = require('../../../lib/component/analyze');

fdescribe('aaa');

describe('component analyze', function () {
  var parsedList = fecom.parse(['comp_sub_b@1.0.0']);
  it('should return the dependencies tree', function (done) {
    Promise
      .all([getInstalled(), getToInstall(parsedList)])
      .then(function (results) {
        var installed = results[0];
        var toInstall = results[1];
        return analyze(toInstall, installed);
      })
      .then(function (result) {
        expect(result).toPlainObject();
        done();
      });
  });
});