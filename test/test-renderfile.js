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
      done();
    }.bind(this));
  });

  it('the generator can be required without throwing', function () {
    // not testing the actual run of generators yet
    this.chromeapp = require('../app');
  });

  describe('#buildData', function () {
    it('should contain no permissions when none asked for', function () {
       var g = this.chromeapp;

       var manifest = g.buildData();
       assert.equal(0, manifest.appPermissions.length);
    });

    it('should populate appFullName when user provides a name', function () {
       var g = this.chromeapp;
       g.appFullName = 'test1234';

       var manifest = g.buildData();
       assert.equal('test1234', manifest.appFullName);
    });

    it('should populate appDescription when user provides a description', function () {
       var g = this.chromeapp;
       g.appDescription = 'test1234';

       var manifest = g.buildData();
       assert.equal('test1234', manifest.appDescription);
    });

    it('should set unlimitedStoragePermission when developer wants unlimitedStorage', function () {
       var g = this.chromeapp;
       g.appPermissions = {};
       g.appPermissions.unlimitedStorage = true;

       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.equal(0, manifestObj.indexOf('unlimitedStorage'));
       assert.equal(1, manifestObj.length);
    });

    it('should set identity permission when developer wants identity', function () {
       var g = this.chromeapp;
       g.appPermissions = {};
       g.appPermissions.identity = true;

       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.notEqual(-1, manifestObj.indexOf('identity'));
       assert.notEqual(-1, manifestObj.indexOf('experimental'));
       assert.equal(2, manifestObj.length);
    });

    it('should not set identity permission when developer doesn\'t want identity', function () {
       var g = this.chromeapp;
       g.appPermissions = {};
       g.appPermissions.identity = false;

       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.equal(-1, manifestObj.indexOf('identity'));
       assert.equal(-1, manifestObj.indexOf('experimental'));
       assert.equal(0, manifestObj.length);
    });

    it('should set usb permission when developer wants usb', function () {
       var g = this.chromeapp;
       g.appPermissions = {};
       g.appPermissions.usb = true;

       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.notEqual(-1, manifestObj.indexOf('usb'));
       assert.notEqual(-1, manifestObj.indexOf('experimental'));
       assert.equal(2, manifestObj.length);
    });

    it('should not set usb permission when developer doesn\'t want usb', function () {
       var g = this.chromeapp;
       g.appPermissions = {};
       g.appPermissions.usb = false;

       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.equal(-1, manifestObj.indexOf('usb'));
       assert.equal(-1, manifestObj.indexOf('experimental'));
       assert.equal(0, manifestObj.length);
    });

   it('should set mediaGalleries permission when developer wants mediaGalleries API', function () {
       var g = this.chromeapp;
       g.appPermissions = {};

       /// turns out we can't set the params so we need to assume that params parser is correct
       g.appPermissions.mediaGalleries = { 'mediaGalleries': ['read', 'allAutoDetected'] };

       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.notEqual(false, !!manifestObj[0].mediaGalleries);
       assert.notEqual(-1, manifestObj[0].mediaGalleries.indexOf('read'));
       assert.notEqual(-1, manifestObj[0].mediaGalleries.indexOf('allAutoDetected'));
       assert.equal(1, manifestObj.length);
    });
  });

  describe('#createManifest', function() {
    it('should have an empty permissions array when no permissions are set', function (done) {
      var expected = [
        ['app/manifest.json', /"permissions": \[\]/],
      ];

      helpers.mockPrompt(this.chromeapp, {
        'name': 'temp',
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    // These only really test the template generation
    it('should populate appName.message when appFullname is given', function (done) {
      var expected = [
        ['app/_locales/en/messages.json', /("message": "Paul1")/]
      ];

      helpers.mockPrompt(this.chromeapp, {
        appFullName: 'Paul1',
        appDescription: 'TEST'
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    it('should populate appDescription.message when appDescription is given', function (done) {
      var expected = [
        ['app/_locales/en/messages.json', /"message": "PauL is Awesome"/]
      ];

      helpers.mockPrompt(this.chromeapp, {
        appFullName: 'TEST',
        appDescription: 'PauL is Awesome'
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    it('should populate permissions array with "unlimitedStorage" when "unlimitedStoraage" is given', function (done) {
      var expected = [
        ['app/manifest.json', /"permissions": \[\s+"unlimitedStorage"\s+\]/]
      ];

      helpers.mockPrompt(this.chromeapp, {
        unlimitedStoragePermission: 'Y'
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    it('should populate permissions array with "identity" and "experimental" when "identity" is given', function (done) {
      var expected = [
        ['app/manifest.json', /"permissions": \[\s+"identity",\s+"experimental"\s+\]/]
      ];

      helpers.mockPrompt(this.chromeapp, {
        identityPermission: 'Y'
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    it('should populate permissions array with "usb" and "experimental"  when "usb" is given', function (done) {
      var expected = [
        ['app/manifest.json', /"permissions": \[\s+"usb",\s+"experimental"\s+\]/]
      ];

      helpers.mockPrompt(this.chromeapp, {
        usbPermission: 'Y'
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });

    it('should populate permissions array with "mediaGalleries" object when "mediaGalleries" is given', function (done) {
      var expected = [
        ['app/manifest.json', /"permissions": \[\s+{\s+"mediaGalleries": \[\s+"read",\s+"allAutoDetected"\s+\]\s+}\s+\]/]
      ];

      helpers.mockPrompt(this.chromeapp, {
        mediagalleryPermission: 'Y'
      });

      this.chromeapp.options['skip-install'] = true;
      this.chromeapp.run({}, function () {
        helpers.assertFiles(expected);
        done();
      });
    });
  });
});
