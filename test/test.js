/*global describe, it */
'use strict';
var assert = require('assert');
var path = require('path');
var helpers = require('yeoman-generator').test;

describe('#app', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.chromeapp = helpers.createGenerator('chromeapp:app', [
          '../../app',
          [
            helpers.createDummyGenerator(),
            'chromeapp:permission'
          ],
          [
            helpers.createDummyGenerator(),
            'mocha:app'
          ]
      ]);

      this.chromeapp.options['skip-install'] = true;

      done();
    }.bind(this));
  });

  describe('#app', function() {
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
        permissions: [],
        matchPatterns: [],
        socketPermission:[]
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
        permissions: [],
        matchPatterns: [],
        socketPermission:[]
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });
  });
});
