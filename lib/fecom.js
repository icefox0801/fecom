'use strict';

var path = require('path');
var EventEmitter = require('events');
var util = require('util');

var _ = require('lodash');
var fs = require('graceful-fs');
var osLocale = require('os-locale');
var YAML = require('yamljs');

var parse = require('./util/parse');
var logger = require('./util/logger');
var promisify = require('./util/promisify');

function getUserHome() {
  return process.env[('win32' === process.platform) ? 'USERPROFILE' : 'HOME'];
}

var Fecom = function () {
  this.root = '';
  this.componentRoot = '';
  this.profile = null;
  this.config = Fecom.defaults.config;
  this.locale = osLocale.sync();
  this.lang = YAML.load(path.join(__dirname, '../i18n/lang.yml'));
  this.tmpDir = path.join(getUserHome(), '.fecom');
  EventEmitter.call(this);
};

util.inherits(Fecom, EventEmitter);

Fecom.defaults = {
  config: {
    name: path.basename(process.cwd()),
    dir: 'components',
    protocol: 'gitlab',
    owner: 'fecom-fe',
    domain: 'http://gitlab.58corp.com'
  }
};

Fecom.prototype = _.assign(Fecom.prototype, {
  initialize: function (cwd, config, profile) {
    // Initialize Fecom instance
    var self = this;

    if (!fs.existsSync(self.tmpDir)) {
      fs.mkdirSync(self.tmpDir);
    }

    self.profile = profile;
    self.config = _.assign({}, self.config, config);
    self.componentRoot = path.join(cwd, self.config.dir);
    self.emit('ready');
  },
  i18n: function (key) {
    var self = this;
    var entity = self.lang[key];
    return (entity.hasOwnProperty(self.locale)) ? entity[self.locale] : entity['en-US'];
  },
  parse: function (str) {
    var self = this;
    var parsed = parse(str);
    return _.assign({}, { owner: self.config.owner }, parsed);
  },
  stringify: function (parsed) {
    return (parsed.owner ? (parsed.owner + '/') : '') + parsed.name + (parsed.version ? ('@' + parsed.version) : '');
  },
  logger: logger,
  errorHandler: function (err) {
    logger.error(err.message);

    if ('debug' === process.env.NODE_ENV) {
      logger.error(err.stack);
    }

  },
  async: promisify
});

module.exports = new Fecom();