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
    .description('A magic component management tool')
    .version(env.modulePackage.version);
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
      options = _(options).pick(['all', 'skip']).set('cwd', env.cwd).value();
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
    .option('-S, --save', 'save components as dependencies')
    .option('-D --save-dev', 'save components as development dependencies')
    .action(function () {
      var install = require('./install');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = _(options).pick(['save', 'saveDev']).set('cwd', env.cwd).value();
      // fecom.logger.info(fecom.i18n('INSTALLING_COMPONENTS'));
      install(semList, options);
    });
  /**
   * Listing component versions
   */
  program
    .command('list [component...]')
    .alias('ls')
    .option('-u, --update', 'check available update(s)')
    .description(fecom.i18n('LIST_COMPONENT_VERSIONS'))
    .action(function () {
      var list = require('./list');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = _(options).pick(['update']).set('cwd', env.cwd).value();
      // fecom.logger.info('Listing component versions...');
      list(semList, options);
    });
  /**
   * User profile
   */
  program
    .command('profile [component...]')
    .alias('p')
    .option('-u, --update', 'check available update(s)')
    .description(fecom.i18n('LIST_COMPONENT_VERSIONS'))
    .action(function () {
      var profile = require('./profile');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var operation = args[0];
      options = _(options).pick(['update']).set('cwd', env.cwd).value();
      profile(operation, options);
    });
  /**
   * Print component dependencies tree
   */
  program
    .command('tree [component...]')
    .alias('t')
    .option('-r, --remote', 'print remote dependencies tree')
    .description('print component dependencies tree')
    .action(function () {
      var profile = require('./tree');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var semList = args[0];
      options = _(options).pick(['remote']).set('cwd', env.cwd).value();
      profile(semList, options);
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
