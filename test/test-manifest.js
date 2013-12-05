/*global describe, it */
'use strict';

var assert = require('assert');
var path = require('path');
var helpers = require('yeoman-generator').test;
var _ = require('lodash');
var Manifest = require('../manifest');
var cloneManifest = {};

describe('#permission generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.generator = helpers.createGenerator('chromeapp:permission', [
        '../../permission'
      ]);
      this.generator.options['skip-install'] = true;

      done();
    }.bind(this));
  });

  it('should have an empty permissions array', function (done) {
    var expected = [
      ['app/manifest.json', /"permissions": \[\]/],
    ];

    helpers.mockPrompt(this.generator, {
      permissions: [],
      matchPatterns: [],
      socketPermission:[]
    });

    this.generator.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });

  it('should populate all of permissions', function (done) {
    var permissions = Manifest.query({
      type: 'app',
      devFeatures: true
    });
    var expected = [
      // host permmision, all_urls, http/s schceme,
      ['app/manifest.json', /\s+"<all_urls>"/],
      ['app/manifest.json', /\s+"http:\/\/\*\/\*",\s+"https:\/\/\*\/\*"/],
      ['app/manifest.json', /\s+"http:\/\/127.0.0.1\/\*"/],
      ['app/manifest.json', /\s+"chrome-extension:\/\/\*\/\*"/],
      // fileBrowserHandler permission
      ['app/manifest.json', /"file_browser_handlers": {\s+"id": "upload",\s+"default_title": "File browser",\s+"file_filters": \[\s+"filesystem:*.*"\s+\]\s+}/],
      // fileSystem permission
      ['app/manifest.json', /\s+"fileSystem": \[\s+"write",\s+"retainEntries",\s+"directory"\s+\]/],
      // mediaGalleries permission
      ['app/manifest.json', /\s+"mediaGalleries": \[\s+"read",\s+"copyTo",\s+"allAutoDetected"\s+\]/],
      // socket permission
      ['app/manifest.json', /\s+"socket": \[\s+"tcp-connect:\*:\*",\s+"tcp-listen:\*:8080"\s+\]/]
    ];

    _.each(permissions, function(perm, permName) {
      if (perm.permission) {
        return;
      }

      expected.push(['app/manifest.json', new RegExp(permName)]);
    });

    helpers.mockPrompt(this.generator, {
      permissions: _.keys(permissions),
      matchPatterns: ['allURLs', 'httpScheme', 'localhost', 'extensionScheme'],
      socketPermission: ['tcp-connect:*:*', 'tcp-listen:*:8080']
    });

    this.generator.run({}, function () {
      // clone current manifest for next testing
      cloneManifest = _.clone(this.generator.manifest);
      helpers.assertFiles(expected);
      done();
    }.bind(this));
  });
});
