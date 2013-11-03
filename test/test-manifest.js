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

      this.chromeapp = helpers.createGenerator('chromeapp:permission', [
        '../../permission'
      ]);
      this.chromeapp.options['skip-install'] = true;

      done();
    }.bind(this));
  });

  describe('#permission', function() {
    it('should populate all of permissions array', function (done) {
      var _ = this.chromeapp._;
      var permissions = this.chromeapp.manifest.getPermissions('app', false);
      var expected = [
        ['app/manifest.json', /"file_browser_handlers": {\s+"id": "upload",\s+"default_title": "File browser",\s+"file_filters": \[\s+"filesystem:*.*"\s+\]\s+}/],
        ['app/manifest.json', /\s+"http:\/\/\*\/\*",\s+"https:\/\/\*\/\*"/],
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
        hostPermission: ['httpScheme', 'anyURLs'],
        socketPermission:[{
          'permission': [{
              'socket': ['tcp-connect:*:*', 'tcp-listen:*:*']
          }]
        }]
      });

      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });
  });
});
