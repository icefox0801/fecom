'use strict';

var getInstalled = require('../../../lib/component/getInstalled');

fdescribe('component getInstalled', function () {
  it('should get installed components', function (done) {
    getInstalled()
      .then(function (installed) {
        var installedList = installed.map(function (component) {
          return component.name + '@' + component.version;
        }).sort();
        expect(installedList).toEqual(['comp_deps@1.0.0',  'comp_sub_a@1.1.0', 'comp_sub_b@1.0.1', 'comp_valid_version@1.1.2']);
        done();
      });
  });
});