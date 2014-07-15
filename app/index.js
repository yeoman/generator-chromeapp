'use strict'

var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var manifest = require('../manifest');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // set source root path to templates
    this.sourceRoot(path.join(__dirname, 'templates'));

    // create a default manifest
    this.manifest = new manifest({
      'icons': {
        '16': 'images/icon-16.png',
        '128': 'images/icon-128.png'
      },
      'app': {
        'background': {
          'scripts': [
            'scripts/main.js',
            'scripts/chromereload.js'
          ]
        }
      }
    });


    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.testFramework = this.options['test-framework'];

    this.option('coffee', {
      desc: 'Use CoffeeScript',
      type: Boolean,
      defaults: false
    });
    this.coffee = this.options.coffee;

    this.option('compass', {
      desc: 'Use Compass',
      type: Boolean,
      defaults: false
    });
    this.compass = this.options.compass;

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var cb = this.async();
    var prompts = [{
      name: 'appName',
      message: 'What would you like to call this application?',
      default:  (this.appname) ? this.appname : 'myChromeApp'
    }, {
      name: 'appDescription',
      message: 'How would you like to describe this application?',
      default: 'My Chrome App'
    }];

    this.prompt(prompts, function(answers) {
      var encode = function(str) {return str && str.replace(/\"/g, '\\"');};
      this.appName = encode(answers.appName);
      this.appDescription = encode(answers.appDescription);
      cb();
    }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function() {
    this.template('_package.json', 'package.json');
  },

  git: function() {
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function() {
    this.copy('bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  mainStylesheet: function () {
    var css = 'styles/main.' + (this.compass ? 's' : '') + 'css';
    this.copy(css, 'app/' + css);
  },

  app: function () {
    this.mkdir('app');
    this.mkdir('app/bower_components');
    this.mkdir('app/styles');
    this.directory('images', 'app/images');
    this.directory(this.coffee ? 'coffees' : 'scripts', 'app/scripts');
    this.template('index.html', 'app/index.html', this);
    this.template('_locales/en/messages.json', 'app/_locales/en/messages.json', this);
  },
  
  permission: function() {
    this.invoke('chromeapp:permission', { 
      options: { manifest: this.manifest }
    });
  },

  install: function () {
    this.on('end', function () {
      // invoke test-framework generator
      this.invoke(this.options['test-framework']+':app', {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          'coffee': this.options.coffee
        }
      });

      // invoke installer
      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }
    });
  }
});
