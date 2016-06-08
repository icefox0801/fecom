'use strict';

var stdin = require('mock-stdin').stdin();

module.exports = function () {

  var responses = [].slice.call(arguments);

  if (responses.length) {
    process.nextTick(function () {

      stdin.on('data', function (data) {

        if (responses.length) {
          setTimeout(function () {
            stdin.send(responses.shift());
          }, 20);
        }

      });

      stdin.send(responses.shift());
    });
  }

};