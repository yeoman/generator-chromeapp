/*global describe, beforeEach, it */
'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('assert');
var _ = require('underscore');

describe('Chromeapp:sample Generator', function () {
  if ('the generator can be required without throwing', function () {
    this.app = require('../app');
  });

  var options = {
    'skip-install': true,
    'skip-pull': false
  };

  var prompts = {
    permissions: [],
    matchPatterns: [],
    socketPermission:[]
  };

  var runGen;

  beforeEach(function () {
    runGen = helpers
      .run(path.join(__dirname, '../samples'))
      .inDir(path.join(__dirname, 'temp'))
      .withGenerators([
        [helpers.createDummyGenerator(), 'mocha:app']
      ]);
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
      'appname': 'analytics',
      'overwrite': true
    };

    this.timeout(10000);

    runGen.withOptions(options).withPrompt(prompts).on('end', function () {
      try {
        assert.file(expected);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
