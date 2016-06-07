'use strict';

var getToInstall = require('../../../lib/component/getToInstall');

describe('component getToInstall', function () {
  it('comp@1.0.0 should return components to install', function (done) {
    getToInstall([{
      owner: 'icefox0801',
      name: 'comp_deps',
      version: '1.0.0'
    }, {
      owner: 'icefox0801',
      name: 'comp_valid_version',
      version : '1.1.2'
    }])
      .then(function (components) {
        expect(components.map(function (component) {
          return component.owner + '/' + component.name + '@' + component.version;
        })).toEqual(['icefox0801/comp_deps@1.0.0', 'icefox0801/comp_valid_version@1.1.2']);
        done();
      });
  });
});