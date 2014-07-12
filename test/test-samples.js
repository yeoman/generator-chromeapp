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

  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      runGen = helpers
        .run(path.join(__dirname, '../samples'))
        .withGenerators([
          [helpers.createDummyGenerator(), 'mocha:app']
        ]);
      done();
    });
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

    this.timeout(0);

    runGen.withOptions(options).withPrompt(prompts).on('end', function () {
      assert.file(expected);
      done();
    });
  });
});
