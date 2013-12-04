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

      this.chromeapp = helpers.createGenerator('chromeapp:samples', [
        '../../samples', [
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
      var appname =  'analytics';
      var expected = [
        'package.json',
        'Gruntfile.js',
        'app/manifest.json',
        'app/background.js',
        'Gruntfile.js',
        '.editorconfig',
      ];

      this.timeout(0);

      helpers.mockPrompt(this.chromeapp, {
        'appname': appname,
        'overwrite': true
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.options['skip-pull'] = true;

      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });
  });
});
