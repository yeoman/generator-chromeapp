/*global describe, beforeEach, it */
'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('assert');
var _ = require('underscore');
var Manifest = require('../manifest');

describe('Chromeapp:permission generator', function () {
  it('the generator can be required without throwing', function () {
    this.app = require('../app');
  });

  var runGen;
  var options = {
    'skip-install': true
  };

  var prompts = {
    permissions: [],
    matchPatterns: [],
    socketPermission:[]
  };

  beforeEach(function () {
    runGen = helpers
      .run(path.join(__dirname, '../permission'))
      .inDir(path.join(__dirname, 'temp'))
      .withGenerators([[helpers.createDummyGenerator(), 'mocha:app']]);
  });

  it('should have an empty permissions array', function (done) {
    runGen
      .withOptions(options)
      .withPrompt(prompts)
      .on('end', function () {
        assert.fileContent([['app/manifest.json', /"permissions": \[\]/]]);
        done();
      });
  });

  it('should populate all of permissions', function (done) {
    var permissions = Manifest.query({
      type: 'app',
      devFeatures: true
    });

    var expectedContents = [
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
      ['app/manifest.json', /\s+"mediaGalleries": \[\s+"read",\s+"delete",\s+"copyTo",\s+"allAutoDetected"\s+\]/],
      // socket permission
      ['app/manifest.json', /\s+"socket": \[\s+"tcp-connect:\*:\*",\s+"tcp-listen:\*:8080"\s+\]/]
    ];

    _.each(permissions, function (perm, permName) {
      if (perm.permission) {
        return;
      }

      expectedContents.push(['app/manifest.json', new RegExp(permName)]);
    });

    runGen
      .withOptions(options)
      .withPrompt(_.extend(prompts, {
        permissions: _.keys(permissions),
        matchPatterns: [
          'allURLs',
          'httpScheme',
          'localhost',
          'extensionScheme'
        ],
        socketPermission: [
          'tcp-connect:*:*',
          'tcp-listen:*:8080'
        ]
      }))
      .on('end', function () {
        assert.fileContent(expectedContents);
        done();
      });
  });
});
