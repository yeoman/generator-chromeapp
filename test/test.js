/*global describe, beforeEach, it */
'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('assert');
var _ = require('underscore');

describe('Chromeapp generator', function () {
  if ('the generator can be required without throwing', function () {
    this.app = require('../app');
  });

  var options = {
    'skip-install': true
  };

  var prompts = {
    permissions: [],
    matchPatterns: [],
    socketPermission:[]
  };

  var runGen;

  beforeEach(function () {
    runGen = helpers
      .run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, 'temp'))
      .withGenerators([
        [helpers.createDummyGenerator(), 'chromeapp:permission'],
        [helpers.createDummyGenerator(), 'mocha:app']
      ]);
  });

  it('should create expected files', function (done) {
    var expected = [
      'app/bower_components',
      'Gruntfile.js',
      'app/_locales/en/messages.json',
      'app/images/icon-128.png',
      'app/images/icon-16.png',
      'app/styles/main.css',
      'app/scripts/main.js',
      'app/index.html'
    ];

    runGen.withOptions(options).withPrompt(
      _.extend(prompts, {'appName': 'temp'})
    ).on('end', function () {
      assert.file(expected);
      assert.fileContent([
        ['bower.json', /"name": "temp"/],
        ['package.json', /"name": "temp"/]
      ]);
      done();
    });
  });

  it('should populate appName.message', function (done) {
    runGen.withOptions(options).withPrompt(
      _.extend(prompts, {
        'appName': 'Paul',
        'appDescription': 'PauL is Awesome',
      })
    ).on('end', function () {
      assert.fileContent([
        ['app/_locales/en/messages.json', /("message": "Paul")/],
        ['app/_locales/en/messages.json', /"message": "PauL is Awesome"/]
      ]);
      done();
    });
  });

  it('should create coffee files', function (done) {
    var expected = [
      'app/scripts/main.coffee',
      'app/scripts/index.coffee',
      'app/scripts/chromereload.coffee',
    ];

    runGen.withOptions(_.extend(options, {'coffee': true})).withPrompt(
      _.extend(prompts, {
        'appName': 'Jimmy',
        'appDescription': 'Jimmy is also Awesome',
      })
    ).on('end', function () {
      assert.file(expected);
      done();
    });
  });
});
