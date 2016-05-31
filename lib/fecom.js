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

function placeholder(value, patterns) {

  if (!patterns.length) {
    return value;
  }

  var regexp = new RegExp('\\{' + (patterns.length - 1) + '\\}', 'g');
  return placeholder(value.replace(regexp, patterns.pop()), patterns);
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
  constructor: Fecom,
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
  i18n: function () {
    var self = this;
    var args = [].slice.call(arguments);
    var key = args.shift();
    var entity = self.lang[key];
    var value = (entity.hasOwnProperty(self.locale)) ? entity[self.locale] : entity['en-US'];

    return placeholder(value, args);
  },
  parse: function (str) {
    var self = this;
    var isResolved = _.startsWith(str, '*');
    var parsed = parse(isResolved ? str.substr(1) : str);

    if (isResolved) {
      parsed.resolved = true;
    }

    return _.assign({}, { owner: self.config.owner }, parsed);
  },
  stringify: function (parsed) {
    var semantic = '';
    semantic += (!parsed.specified && parsed.resolved) ? '*' : '';
    semantic += parsed.owner ? (parsed.owner + '/') : '';
    semantic += parsed.name;
    semantic += parsed.version ? ('@' + parsed.version) : '';
    semantic += parsed.status ? (' (' + parsed.status + ')') : '';
    return semantic;
  },
  logger: logger,
  errorHandler: function (err) {

    if ('string' === typeof err) {
      err = new Error(err);
    }

    logger.error(err.message);

    if (err.hasOwnProperty('conflictList') && err.conflictList.length > 0) {
      err.conflictList.forEach(function (conflict) {
        var components = conflict.owners.map(function (owner) {
          return owner + '/' + conflict.name;
        }).join(', ');

        logger.info(components);
      });
    }

    if ('debug' === process.env.NODE_ENV) {
      logger.error(err.stack);
    }

  },
  async: promisify
});

module.exports = new Fecom();
