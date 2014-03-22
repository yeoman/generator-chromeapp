var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var manifest = require('../manifest');

var ChromeAppGenerator = module.exports = function ChromeAppGenerator(args, options, config) {
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

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';
  this.coffee = options.coffee;
  this.compass = options.compass;

  // add more permissions
  this.hookFor('chromeapp:permission', { as: 'subgen' });

  // for hooks to resolve on mocha by default
  options['test-framework'] = this.testFramework;

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', {
    as: 'app',
    options: {
      options: {
        'skip-install': options['skip-install-message'],
        'skip-message': options['skip-install']
      }
    }
  });

  this.options = options;

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(ChromeAppGenerator, yeoman.generators.Base);

ChromeAppGenerator.prototype.askFor = function askFor(argument) {
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
};

ChromeAppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

ChromeAppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

ChromeAppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

ChromeAppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

ChromeAppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

ChromeAppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

ChromeAppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  var css = 'styles/main.' + (this.compass ? 's' : '') + 'css';
  this.copy(css, 'app/' + css);
};

ChromeAppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/bower_components');
  this.mkdir('app/styles');
  this.directory('images', 'app/images');
  this.directory(this.coffee ? 'coffees' : 'scripts', 'app/scripts');
  this.template('index.html', 'app/index.html', this);
  this.template('_locales/en/messages.json', 'app/_locales/en/messages.json', this);
  this.write('app/manifest.json', this.manifest.stringify());
};

ChromeAppGenerator.prototype.install = function () {
  if (this.options['skip-install']) {
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options['skip-install-message'],
    skipInstall: this.options['skip-install'],
    callback: done
  });
}
