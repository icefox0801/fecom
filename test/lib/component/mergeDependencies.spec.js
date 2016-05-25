'use strict';

var mergeDependencies = require('../../../lib/component/mergeDependencies');

fdescribe('component mergeDependencies', function () {
  var newParsedList = [
    {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0',
      specified: true
    },
    {
      name: 'comp_sub_b',
      owner: 'icefox0801',
      version: '1.0.1'
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.1.0',
      resolved: true,
      specified: true
    }
  ];
  var oldParsedList = [
    {
      name: 'comp_deps',
      owner: 'icefox0801',
      specified: true
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      specified: true
    },
    {
      name: 'comp_valid_version',
      owner: 'icefox0801',
      specified: true
    }
  ];
  var expectedDependencies = [
    {
      name: 'comp_deps',
      owner: 'icefox0801',
      version: '1.0.0',
      specified: true
    },
    {
      name: 'comp_sub_a',
      owner: 'icefox0801',
      version: '1.1.0',
      resolved: true,
      specified: true
    },
    {
      name: 'comp_valid_version',
      owner: 'icefox0801',
      specified: true
    }
  ];
  it('should merge to valid dependencies', function () {
    expect(mergeDependencies(newParsedList, oldParsedList)).toEqual(expectedDependencies);
  });
});