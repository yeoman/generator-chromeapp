/*global describe, beforeEach, it */
'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('assert');
var _ = require('underscore');

describe('Chromeapp:sample generator', function () {
  var runGen;
  var options = {
    'skip-install': true,
    'skip-pull': false
  };

  var prompts = {
    permissions: [],
    matchPatterns: [],
    socketPermission:[]
  };

  beforeEach(function () {
    runGen = helpers
      .run(path.join(__dirname, '../samples'))
      .inDir(path.join(__dirname, 'temp'))
      .withGenerators([[helpers.createDummyGenerator(), 'mocha:app']]);
  });

  it('should create expected files', function (done) {
    var expected = [
      'package.json',
      'Gruntfile.js',
      'app/manifest.json',
      'app/background.js',
      'Gruntfile.js',
      '.editorconfig',
    ];

    var prompts = {
      appName: 'analytics',
      overwrite: true
    };

    runGen
      .withOptions(options)
      .withPrompt(prompts)
      .on('end', function () {
        try {
          assert.file(expected);
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should be copied manifest with comments', function (done) {
    var expected = [
      'package.json'
    ];

    var prompts = {
      appName: 'identity',
      overwrite: true
    };

    runGen
      .withOptions(options)
      .withPrompt(prompts)
      .on('end', function () {
        try {
          assert.file(expected);
          done();
        } catch (err) {
          done(err);
        }
      });
  });
});
