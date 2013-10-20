/*global describe, it */
'use strict';
var assert = require('assert');
var path = require('path');
var helpers = require('yeoman-generator').test;

describe('Chrome App Generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.chromeapp = helpers.createGenerator('chromeapp:app', [
        '../../app', [
          helpers.createDummyGenerator(),
          'mocha:app'
        ]
      ]);

      this.chromeapp.options['skip-install'] = true;

      done();
    }.bind(this));
  });

  describe('#expectedFiles', function() {
    it('should create expected files', function (done) {
      var expected = [
        'app/bower_components',
        ['bower.json', /"name": "temp"/],
        ['package.json', /"name": "temp"/],
        'Gruntfile.js',
        'app/manifest.json',
        'app/_locales/en/messages.json',
        'app/images/icon-128.png',
        'app/images/icon-16.png',
        'app/styles/main.css',
        'app/scripts/main.js',
        'app/index.html'
      ];

      helpers.mockPrompt(this.chromeapp, {
        'name': 'temp',
        'permissions': [],
        'hostPermission': [],
        'socketPermission':[]
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    it('should populate appName.message', function (done) {
      var expected = [
        ['app/_locales/en/messages.json', /("message": "Paul")/],
        ['app/_locales/en/messages.json', /"message": "PauL is Awesome"/]
      ];

      helpers.mockPrompt(this.chromeapp, {
        'appName': 'Paul',
        'appDescription': 'PauL is Awesome',
        'permissions': [],
        'hostPermission': [],
        'socketPermission':[]
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });
  });

  describe('#manifest.json', function() {
    it('should have an empty permissions array', function (done) {
      var expected = [
        ['app/manifest.json', /"permissions": \[\]/],
      ];

      helpers.mockPrompt(this.chromeapp, {
        'name': 'temp',
        'permissions': [],
        'hostPermission': [],
        'socketPermission':[]
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    it('should populate permissions array', function (done) {
      var _ = this.chromeapp._;
      var permissions = this.chromeapp.manifest.getPermissions('app', false);
      var expected = [
        ['app/manifest.json', /"file_browser_handlers": {\s+"id": "upload",\s+"default_title": "File browser",\s+"file_filters": \[\s+"filesystem:*.*"\s+\]\s+}/],
        ['app/manifest.json', /\s+"http:\/\/\*\/\*",\s+"https:\/\/\*\/\*"/],
        ['app/manifest.json', /\s+"<all_urls>"/],
        ['app/manifest.json', /\s+"fileSystem": \[\s+"write",\s+"retainEntries",\s+"directory"\s+\]/],
        ['app/manifest.json', /\s+"mediaGalleries": \[\s+"read",\s+"copyTo",\s+"allAutoDetected"\s+\]/],
        ['app/manifest.json', /\s+"socket": \[\s+"tcp-connect:\*:\*",\s+"tcp-listen:\*:\*"\s+\]/]
      ];

      this.chromeapp._.each(permissions, function(perm, permName) {
        if (permName === 'socket' || perm.permission) return;
        expected.push(['app/manifest.json', new RegExp(permName)]);
      });

      helpers.mockPrompt(this.chromeapp, {
        permissions: _.keys(permissions),
        hostPermission: ['httpScheme', 'allURLs'],
        socketPermission:[{
          'permission': [{
              'socket': ['tcp-connect:*:*', 'tcp-listen:*:*']
          }]
        }]
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });
  });
});
