'use strict';

var util = require('util');
var yeoman = require('yeoman-generator');
var https = require('https');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var shell = require('shelljs');

function cloneSample(username, repo, branch, cb) {
  var self = this;
  var git = {};
  var cache;

  function shellExec(command, cb) {
    if (shell.exec(command, {silent: false}).code !== 0) {
      cb('Failed shell execution, ' + command);
      return;
    }

    cb();
  }

  function expandDirs(cwd) {
    return fs.readdirSync(cwd).filter(function (filepath) {
        if (filepath.indexOf('.') === 0) {
          return;
        }

        return fs.statSync(path.join(cwd, filepath)).isDirectory();
      });
  }

  if (!cb) {
    cb = branch;
    branch = 'master';
  }

  cache = path.join(this.cacheRoot(), username, repo, branch);
  git.pull = ['git pull origin ' + branch];
  git.clone = [
    'git clone',
    ['https://github.com', username, repo].join('/'),
    '-b', branch, cache
  ].join(' ');

  fs.stat(cache, function (err) {
    var cwd = process.cwd();

    if (err) {
      shellExec(git.clone, done);
      return;
    }

    if (self.options['skip-pull']) {
      done();
    }

    process.chdir(cache);
    shellExec(git.pull, done);
    process.chdir(cwd);
  });

  function done(err) {
    if (err) {
      cb(err);
      return;
    }

    var files = expandDirs(path.join(cache, 'samples'));
    var clone = {};

    clone.directory = function (source, destination, cb) {
      var root = self.sourceRoot();
      // Add prefix path of GoogleChrome/chrome-app-samples
      source = 'samples/' + source;
      self.sourceRoot(cache);
      self.bulkDirectory(source, destination);
      self.conflicter.resolve(function (err) {
        self.sourceRoot(root);
        cb();
      });
    };

    cb(err, clone, files);
  }

  return this;
}

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
      this.installDependencies({
        skipInstall: this.options['skip-install']
      });
    });

    this.overwrite = true;
    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
  },

  app: function () {
    var cb = this.async();
    var self = this;

    self.log('Checking for google chrome-app-sample repository on github');

    // clone or pull from https://github.com/GoogleChrome/chrome-app-samples.git
    cloneSample.call(this, 'GoogleChrome', 'chrome-app-samples.git', 'master', function (err, clone, files) {
      var prompt = {
        type: 'list',
        name: 'appName',
        message: 'What sample would you like to use?',
        choices: files
      };

      self.prompt(prompt, function (answers) {
        var filepath = path.join(self.destinationRoot() + '/app');
        self.appName = answers.appName;

        function done(copy) {
          if (copy) {
            clone.directory(self.appName, filepath, cb);
          }
        }

        // checking for collision of app
        if (!fs.existsSync(filepath)) {
          return done(true);
        }

        var prompt = {
          name: 'overwrite',
          type: 'confirm',
          message: 'Chrome App is already exist. Overwrite the `App`' + '?',
          default: false
        };

        self.prompt(prompt, function (answers) {
          // save overwrite flag to after process
          self.overwrite = answers.overwrite;

          // remove previous app if user want to remove it
          if (answers.overwrite) {
            return rimraf(filepath, function (err) {
              self.log.force('Overwrite by ' + self.appName);
              done(true);
            });
          }

          done(false);
        });
      });
    });
  },

  packages: function () {
    // aborting
    if (this.overwrite === false) {
      this.options['skip-install'] = true;
      return;
    }

    // set source root path to templates
    this.sourceRoot(path.join(__dirname, 'templates'));

    this.copy('_package.json', 'package.json');
    this.template('Gruntfile.js', 'Gruntfile.js');

    // getting templates from chromeapp:app
    this.sourceRoot(path.join(__dirname, '../app/templates'));

    this.copy('editorconfig', '.editorconfig');
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
    this.copy('scripts/chromereload.js', 'app/chromereload.js');
  },

  manifest: function () {
    var manifestPath;
    var manifest;

    // find manifest.json in sample app
    manifestPath = this.expand('**/manifest.json', {
      cwd: process.cwd()
    });

    if (!manifestPath.length) {
      throw new Error('manifest.json not found');
    }

    manifestPath = path.join(process.cwd(), manifestPath[0]);
    manifest = JSON.parse(this.readFileAsString(manifestPath));

    if (!manifest) {
      throw new Error('manifest.json has a problem');
    }

    // add reload script into manifest.json in sample app
    manifest.app.background.scripts.push('chromereload.js');
    this.writeFileFromString(JSON.stringify(manifest, null, 4), manifestPath);
  }
});
