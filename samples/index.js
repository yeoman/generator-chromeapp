'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var https = require('https');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

// clone function, tweak the function from generator:base:action:remote
function clone(username, repo, branch, cb) {
  if (!cb) {
    cb = branch;
    branch = 'master';
  }

  var self = this;
  var cache = path.join(this.cacheRoot(), username, repo, branch);
  var git = {
    clone: ['git clone', ['https://github.com', username, repo].join('/'), '-b', branch, cache].join(' '),
    pull: ['git pull origin ' + branch]
  };

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

    clone.cachePath = cache;

    clone.directory = function directory(source, destination) {
      var root = self.sourceRoot();
      self.sourceRoot(cache);
      self.directory(source, destination);
      self.sourceRoot(root);
    };

    cb(err, clone, files, cache);
  }

  return this;
};

// Copy target sample app from cache. If it is already exist?
// Show the prompt to overwrite or not
function copySampleapp(done) {
  var log = this.log;
  var appname = this.appname;
  var filepath = path.join(this.destinationRoot() + 'app');

  if (!fs.existsSync(filepath)) {
    return done(true);
  }

  // Check the overwrite option if `app` is already exist
  var config = [{
    type: 'expand',
    message: 'Overwrite `app`' + '?',
    choices: [{
      key: 'y',
      name: 'Overwrite',
      value: true
    }, {
      key: 'n',
      name: 'Do not overwrite',
      value: false
    }],
    name: 'overwrite'
  }];

  this.prompt(config, function(answers) {
    if (!answers.overwrite) {
      done(false);
    }

    rimraf(filepath, function (err) {
      log.force('Overwrite with ' + appname);
      if (err) {
        return done(false);
      }

      done(true);
    });
  });

  return this;
};

var ChromeappSampleGenerator = module.exports = function ChromeappSampleGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // Extend util functions
  this._.extend(yeoman.generators.Base.prototype, {
    clone: clone,
    copySampleapp: copySampleapp
  });

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(ChromeappSampleGenerator, yeoman.generators.Base);

ChromeappSampleGenerator.prototype.app = function app() {
  var cb = this.async();
  var self = this;

  // clone or pull from https://github.com/GoogleChrome/chrome-app-samples.git
  this.clone('GoogleChrome', 'chrome-app-samples.git', 'master', function(err, clone, files, cache) {
    var prompt = [{
      type: 'list',
      name: 'appname',
      message: 'What sample would you like to use?',
      choices: files
    }];

    // Save sample name and copy sample from cached chromeapp samples
    function done(copy) {
      if (copy) {
        clone.directory(self.appname, 'app');
      }
      cb();
    };

    self.prompt(prompt, function(answers) {
      self.appname = answers.appname;
      self.copySampleapp(done);
    });
  });
};

ChromeappSampleGenerator.prototype.packages = function packages() {
  this.sourceRoot(path.join(__dirname, '../app/templates'));

  var manifestPath = this.expand('**/manifest.json', {'cwd': process.cwd()});
  var manifest;

  if (manifestPath.length === 0) {
    throw 'Not found manifest.json';
  }

  manifestPath = path.join(process.cwd(), manifestPath[0]);
  manifest = JSON.parse(this.readFileAsString(manifestPath));

  if (manifest) {
    manifest.app.background.scripts.push('chromereload.js');
    this.writeFileFromString(JSON.stringify(manifest, null, 4), manifestPath);
    this.copy('scripts/chromereload.js', 'app/chromereload.js');
  }

  this.copy('_package.json', 'package.json');
  this.mkdir('app/bower_components');
  this.copy('_bower.json', 'bower.json');
  this.copy('bowerrc', '.bowerrc');
  this.copy('editorconfig', '.editorconfig');
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
  this.copy('jshintrc', '.jshintrc');

  this.template('Gruntfile.samples.js', 'Gruntfile.js');
};
