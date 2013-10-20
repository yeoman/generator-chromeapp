'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var Manifest = require('../manifest');

var PermissionGenerator = module.exports = function PermissionGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // Create and load that exist manifest.json
  this.manifest = new Manifest(this);
  this.manifest.load('/app/manifest.json');
};

util.inherits(PermissionGenerator, yeoman.generators.Base);

PermissionGenerator.prototype.askForPermissions = function askForPermissions() {
  this.manifest.askForPermissions('app', {filter: true});
};

PermissionGenerator.prototype.app = function app() {
  this.write('app/manifest.json', this.manifest.stringify());
};
