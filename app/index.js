var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var Manifest = require('../manifest');

var ChromeAppGenerator = module.exports = function ChromeAppGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);
  this.sourceRoot(path.join(__dirname, 'templates'));

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  // add more permissions
  this.hookFor('chromeapp:permission', { args: args });

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

  // create a default manifest
  this.manifest = new Manifest({
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
};

util.inherits(ChromeAppGenerator, yeoman.generators.Base);

ChromeAppGenerator.prototype.askFor = function askFor(argument) {
  var cb = this.async();
  var prompts = [{
    name: 'appName',
    message: 'What would you like to call this application?',
    default: 'myChromeApp'
  }, {
    name: 'appDescription',
    message: 'How would you like to describe this application?',
    default: 'My Chrome app'
  }];

  this.prompt(prompts, function(answers) {
    var encode = function(str) {return str && str.replace(/\"/g, '\\"');};
    this.appName = encode(answers.appName);
    this.appDescription = encode(answers.appDescription);
    cb();
  }.bind(this));
};

ChromeAppGenerator.prototype.packages = function packages() {
  this.copy('_package.json', 'package.json');
  this.mkdir('app/bower_components');
  this.copy('_bower.json', 'bower.json');
  this.copy('bowerrc', '.bowerrc');
  this.copy('editorconfig', '.editorconfig');
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
  this.copy('jshintrc', '.jshintrc');
  this.template('Gruntfile.js');
};

ChromeAppGenerator.prototype.app = function app() {
  this.directory('images', 'app/images');
  this.directory('scripts', 'app/scripts');
  this.directory('styles', 'app/styles');
  this.template('index.html', 'app/index.html', this);
  this.template('_locales/en/messages.json', 'app/_locales/en/messages.json', this);
  this.write('app/manifest.json', this.manifest.stringify());
};
