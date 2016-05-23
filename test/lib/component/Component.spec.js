'use strict';

var fecom = require('../../../lib/fecom');
var Component = require('../../../lib/component/Component');

describe('component constructor', function () {
  var parsed = {
    name: 'comp_deps',
    owner: 'icefox0801',
    version: '1.0.0'
  };
  var component = new Component(parsed, 'remote');
  var expectedTree = {
    props: {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0'
    },
    subNodes: [
      {
        props: {
          name: 'comp_sub_a',
          owner: 'icefox0801',
          version: '1.1.0'
        },
        subNodes: []
      },
      {
        props: {
          name: 'comp_sub_b',
          owner: 'icefox0801',
          version: '1.0.1'
        },
        subNodes: [
          {
            props: {
              name: 'comp_sub_a',
              owner: 'icefox0801',
              version: '1.0.1'
            },
            subNodes: []
          }
        ]
      }
    ]
  };
  beforeAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });
  describe('getDependencies', function () {
    it('should return valid dependencies tree', function (done) {
      component.getDependencies()
        .then(function (tree) {
          expect(tree).toEqual(expectedTree);
          done();
        });
    });
  });
});