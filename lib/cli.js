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

  // bootstrap(env);
  // Test
  bootstrap(env, {
    username: 'icefox0801',
    email: 'icefox0801@hotmail.com',
    token: '4zWuy_my-jMuSnjLSkKv'
  }, {
    owner: 'icefox0801',
    domain: 'https://gitlab.com'
  });

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
      fecom.logger.info(fecom.i18n('INITIALIZING_COMPONENT'));
      init(options);
    });
  /**
   * Installing component(s)
   */
  program
    .command('install [component...]')
    .alias('i')
    .description('install component(s)')
    .option('-S, --save', 'save components as dependencies')
    .option('-D --save-dev', 'save components as development dependencies')
    .action(function () {
      var install = require('./install');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var list = args[0];
      options = _(options).pick(['save', 'saveDev']).set('cwd', env.cwd).value();
      fecom.logger.info('Installing component(s)...');
      install(list, options);
    });
  /**
   * Listing component versions
   */
  program
    .command('list [component...]')
    .alias('ls')
    .option('-t, --tt', '')
    .description('list component versions')
    .action(function () {
      var list = require('./list');
      var args = [].slice.call(arguments);
      var options = args.pop();
      var components = args[0];
      options = _(options).pick(['tt']).set('cwd', env.cwd).value();
      fecom.logger.info('Listing component versions...');
      list(components, options);
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
