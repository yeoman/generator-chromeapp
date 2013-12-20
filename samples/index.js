'use strict';

var util = require('util');
var yeoman = require('yeoman-generator');
var https = require('https');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

// clone function, tweak the from action.remote
function clone(username, repo, branch, cb) {
  var self = this;
  var cache, git;

  function shellExec(command, cb) {
    return cb(self.shell.exec(command, { silent: false }).code !== 0) ?
            undefined : 'Failed shell execution, ' + command;
  };

  function expandDirs(cwd) {
    return fs.readdirSync(cwd).filter(function(filepath) {
        return (filepath.indexOf('.') === 0) ? false :
        fs.statSync(path.join(cwd, filepath)).isDirectory()
      });
  };

  if (!cb) {
    cb = branch;
    branch = 'master';
  }

  cache = path.join(this.cacheRoot(), username, repo, branch);
  git = {
    clone: ['git clone', ['https://github.com', username, repo].join('/'), '-b', branch, cache].join(' '),
    pull: ['git pull origin ' + branch]
  };

  fs.stat(cache, function (err) {
    if (!err) {
      if (!self.options['skip-pull']) {
        var cwd = process.cwd();
        process.chdir(cache);
        shellExec(git.pull, done);
        process.chdir(cwd);
      } else {
        done();
      }
    } else {
      shellExec(git.clone, done);
    }
  });

  function done(err) {
    if (err) {
      return cb(err);
    }

    var files = expandDirs(cache);
    var clone = {};

    clone.directory = function directory(source, destination) {
      var root = self.sourceRoot();
      self.sourceRoot(cache);
      self.directory(source, destination);
      self.sourceRoot(root);
    };

    cb(err, clone, files);
  }

  return this;
};

var ChromeappSampleGenerator = module.exports = function ChromeappSampleGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // extend generator with clone
  this._.extend(yeoman.generators.Base.prototype, {
    clone: clone
  });

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

  // overwrite flag
  this.overwrite = true;
};

util.inherits(ChromeappSampleGenerator, yeoman.generators.Base);

ChromeappSampleGenerator.prototype.app = function app() {
  var cb = this.async();
  var self = this;

  self.log('Checking for google chrome-app-sample repository on github');

  // clone or pull from https://github.com/GoogleChrome/chrome-app-samples.git
  this.clone('GoogleChrome', 'chrome-app-samples.git', 'master', function(err, clone, files) {
    var prompt = {
      type: 'list',
      name: 'appname',
      message: 'What sample would you like to use?',
      choices: files
    };

    self.prompt(prompt, function(answers) {
      var filepath = path.join(self.destinationRoot() + 'app');

      self.appname = answers.appname;

      function done(copy) {
        copy && clone.directory(self.appname, 'app');
        cb();
      };

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

      self.prompt(prompt, function(answers) {
        // save overwrite flag to after process
        self.overwrite = answers.overwrite;

        // remove previous app if user want to remove it
        if (answers.overwrite) {
          rimraf(filepath, function (err) {
            self.log.force('Overwrite by ' + self.appname);
            done(true);
          });
        } else {
          done(false);
        }
      });
    });
  })
};

ChromeappSampleGenerator.prototype.packages = function packages() {
  var manifestPath;
  var manifest;

  // aborting
  if (this.overwrite === false) {
    this.options['skip-install'] = true;
    return;
  }

  // find manifest.json in sample app
  manifestPath = this.expand('**/manifest.json', {'cwd': process.cwd()});

  if (manifestPath.length === 0) {
    throw 'manifest.json not found';
  }

  manifestPath = path.join(process.cwd(), manifestPath[0]);
  manifest = JSON.parse(this.readFileAsString(manifestPath));

  if (!manifest) {
    throw 'manifest.json has a problem';
  }

  this.copy('_package.json', 'package.json');
  this.template('Gruntfile.js', 'Gruntfile.js');

  // getting templates from chromeapp:app
  this.sourceRoot(path.join(__dirname, '../app/templates'));

  this.copy('editorconfig', '.editorconfig');
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');

  // add reload script into manifest.json in sample app
  manifest.app.background.scripts.push('chromereload.js');
  this.writeFileFromString(JSON.stringify(manifest, null, 4), manifestPath);
  this.copy('scripts/chromereload.js', 'app/chromereload.js');


};
