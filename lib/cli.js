'use strict';

var _ = require('lodash');
var program = require('commander');
var colors = require('colors');

var fecom = require('./fecom');
var bootstrap = require('./bootstrap');
var gitlabRepo = require('./remote/gitlab');

var cli = {};

cli.start = function (env) {

  fecom.on('ready', function () {
    gitlabRepo.initialize();
    cli.run(env);
  });

  bootstrap(env);

};

cli.name = 'fecom';

cli.run = function (env) {
  /**
   * Global command
   */
  program.usage('[options]')
    .description('A magic component management tool');
  /**
   * Initialize component
   */
  program
    .command('init')
    .description(fecom.i18n('INITIALIZE_COMPONENT'))
    .option('-A, --all', 'init with all options')
    .option('-S, --skip', 'skip setting and use all default options')
    .action(function () {
      var init = require('./init');
      var args = [].slice.call(arguments);
      var options = args.pop();
      options = _(options).pick(['all', 'skip']).value();
      // fecom.logger.info(fecom.i18n('INITIALIZING_COMPONENT'));
      init(options);
    });
  /**
   * Installing component(s)
   */
  program
    .command('install [component...]')
    .alias('i')
    .description(fecom.i18n('INSTALL_COMPONENTS'))
    .option('-R, --resolve', 'resolve version conflict')
    .action(function () {
      var install = require('./install');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = _(options).pick(['resolve']).value();
      // fecom.logger.info(fecom.i18n('INSTALLING_COMPONENTS'));
      install(semList, options);
    });
  /**
   * Uninstalling component(s)
   */
  program
    .command('uninstall <component...>')
    .alias('un')
    .description(fecom.i18n('UNINSTALL_COMPONENTS'))
    .option('-F, --force', 'force to uninstall component(s)')
    .action(function () {
      var uninstall = require('./uninstall');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = _(options).pick(['force']).value();
      // fecom.logger.info(fecom.i18n('INSTALLING_COMPONENTS'));
      uninstall(semList, options);
    });
  /**
   * Listing component versions
   */
  program
    .command('list [component...]')
    .alias('ls')
    .option('-U, --update', 'check available update(s)')
    .description(fecom.i18n('LIST_COMPONENT_VERSIONS'))
    .action(function () {
      var list = require('./list');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = _(options).pick(['update']).value();
      // fecom.logger.info('Listing component versions...');
      list(semList, options);
    });
  /**
   * User profile
   */
  program
    .command('profile [query]')
    .alias('p')
    .option('-D, --default', 'configure default settings')
    .description(fecom.i18n('MANAGE_USER_PROFILE'))
    .action(function () {
      var profile = require('./profile');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var query = args[0];
      options = _(options).pick(['default']).value();
      profile(query, options);
    });
  /**
   * Print component dependencies tree
   */
  program
    .command('tree [component...]')
    .alias('t')
    .option('-R, --remote', 'print remote dependencies tree')
    .description(fecom.i18n('PRINT_COMPONENT_DEPENDENCIES_TREE'))
    .action(function () {
      var profile = require('./tree');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = _(options).pick(['remote']).value();
      profile(semList, options);
    });
  /**
   * Versioning component(s)
   */
  program
    .command('version [releaseType]')
    .alias('v')
    .option('-N, --number', 'versioning component with specific number')
    .description(fecom.i18n('VERSIONING_COMPONENT'))
    .action(function () {
      var version = require('./version');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var releaseType = args[0];
      options = _(options).pick(['number']).value();
      // fecom.logger.info('Listing component versions...');
      version(releaseType, options);
    });
  /**
   * Updating component(s)
   */
  program
    .command('update [component...]')
    .alias('u')
    .description(fecom.i18n('UPDATE_COMPONENTS'))
    .action(function () {
      var update = require('./update');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = {};
      // fecom.logger.info(fecom.i18n('INSTALLING_COMPONENTS'));
      update(semList, options);
    });
  program.parse(process.argv);
  // If no sub-commands and options are passed, output help info
  if (!process.argv.slice(2).length) {
    program.outputHelp(function (txt) {
      var json = require('../package.json');
      fecom.logger.info('fecom version: ' + json.version.yellow);
      return txt;
    });
  }
};

module.exports = cli;
