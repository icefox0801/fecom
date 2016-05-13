'use strict';

var log4js = require('log4js');

log4js.configure({
  appenders: [
    {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[%-5r%] %[%-5p%] %[%-5m%]'
      }
    }
  ]
});

module.exports = new log4js.getLogger('fecom');