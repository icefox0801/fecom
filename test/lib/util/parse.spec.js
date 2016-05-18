'use strict';

var parse = require('../../../lib/util/parse');

describe('util parse', function () {
  it('owner/comp@1.0.0 should return correctly parsed object', function () {
    expect(parse('owner/comp@1.0.0')).toEqual({
      owner: 'owner',
      name: 'comp',
      version: '1.0.0'
    });
  });
});