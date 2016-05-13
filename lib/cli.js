'use strict';

var _ = require('lodash');
var program = require('commander');
var colors = require('colors');

var logger = require('./util/logger');

var cli = {};

cli.name = 'fecom';

cli.run = function (env) {
  /**
   * Global command
   */
  program.usage('[options]')
    .description('A magic component management tool')
    .version(env.modulePackage.version);
  /**
   * Initialize component
   */
  program
    .command('init')
    .description('Initialize component')
    .option('-A, --all', 'init with all options')
    .option('-S, --skip', 'skip setting and use all default options')
    .action(function () {
      var initComponent = require('./init');
      var args = [].slice.call(arguments);
      var options = args.shift();
      options = _(options).pick(['all', 'skip']).set('cwd', env.cwd).value();
      logger.info('Initializing component...');
      initComponent(options);
    });
  /**
   * Installing component(s)
   */
  program
    .command('install [component...]')
    .alias('i')
    .description('Installing component(s)')
    .action(function () {
      var installComponent = require('./install');
      var args = [].slice.call(arguments);
      var options = args.shift();
      logger.info('Installing component(s)...');
      installComponent(options);
    });
  /**
   * Listing component versions
   */
  program
    .command('list [component...]')
    .alias('ls')
    .description('Listing component versions')
    .action(function () {
      logger.info('Listing component versions...');
    });

  program.parse(process.argv);
  // If no sub-commands and options are passed, output help info
  if (!process.argv.slice(2).length) {
    program.outputHelp(function (txt) {
      return txt;
    });
  }
};

module.exports = cli;
