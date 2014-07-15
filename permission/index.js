'use strict';

var util = require('util');
var yeoman = require('yeoman-generator');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var manifest = require('../manifest');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    var dest = path.join(process.cwd(), '/app/manifest.json');
    
    // load the manifest.json if already exist
    if (this.options.manifest) {
      this.manifest = this.options.manifest;
    }
    else if (fs.existsSync(dest)) {
      this.log.info('Load manifest.json');
      this.manifest = new manifest(JSON.parse(this.read(dest)));
    } else {
      this.manifest = new manifest({});
    }
  },

  askForPermissions: function () {
    var cb = this.async();
    var currentPerms = this.manifest.fields.permissions;
    var permissions = manifest.query({
      type: 'app',
      devFeatures: true
    });
    var choices = [];

    _.each(permissions, function(perm, name) {
      var choice = {
        key: name,
        name: perm.status ? name + ' (' + perm.status + ')' : name
      }

      choices.push(choice);
    });

    var prompt = {
      type: 'checkbox',
      name: 'permissions',
      message: 'Select a permissions for Chrome App',
      paginated : true,
      choices: choices
    };

    this.prompt(prompt, function (answers) {
      this.permissions = answers.permissions;
      cb();
    }.bind(this));
  },

  askForMatchPatterns: function () {
    var cb = this.async();
    var prompt = {
      type: 'checkbox',
      name: 'matchPatterns',
      message: 'Select URL match patterns',
      choices: [{
        name: 'All of permitted scheme',
        value: 'allURLs',
      }, {
        name: 'HTTP/S scheme',
        value: 'httpScheme',
      }, {
        name: 'HTTP scheme with host 127.0.0.1',
        value: 'localhost'
      }, {
        name: 'chrome-extension scheme',
        value: 'extensionScheme'
      }]
    };

    this.prompt(prompt, function (answers) {
      var patterns = answers.matchPatterns;

      function hasPattern(pattern) {return patterns.indexOf(pattern) !== -1;};

      // Push match-patterns wichi user has selected.
      if (hasPattern('allURLs'))
        this.permissions.push('<all_urls>');

      if (hasPattern('httpScheme')) {
        this.permissions.push('http://*/*');
        this.permissions.push('https://*/*');
      }

      if (hasPattern('localhost')) {
        this.permissions.push('http://127.0.0.1/*');
      }

      if (hasPattern('extensionScheme')) {
        this.permissions.push('chrome-extension://*/*');
      }

      cb();
    }.bind(this));
  },

  askForSocketPermission: function () {
    if (_.indexOf(this.permissions, 'socket') !== -1) {
      var cb = this.async();

      var prompt = {
        type: 'checkbox',
        name: 'socketPermission',
        message: 'Select a Socket permission rules',
        choices: [{
          name: 'TCP connecting and listening rules',
          value: ['tcp-listen:*:*', 'tcp-connect:*:*']
        }, {
          name: 'UDP receiving and sending rules',
          value: ['udp-bind:*:*', 'udp-send-to:*:*']
        }],
        filter: function(val) {
          return _.union(val[0], val[1] ? val[1] : []);
        }
      };

      this.prompt(prompt, function (answers) {
        var perm = manifest.query({name: 'socket'});
        perm.socket.permission.socket = answers.socketPermission;
        this.manifest.setPermissions(perm);
        cb();
      }.bind(this));
    }
  },

  app: function () {
    this.manifest.setPermissions(this.permissions);
    this.write('app/manifest.json', this.manifest.stringify());
  }
});
