var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');

var ChromeAppGenerator = module.exports = function ChromeAppGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);
  this.sourceRoot(path.join(__dirname, 'templates'));
  this.appPermissions = {};

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

util.inherits(ChromeAppGenerator, yeoman.generators.Base);

ChromeAppGenerator.prototype.askFor = function askFor(argument) {
  var cb = this.async();

  var prompts = [{
    name: 'appFullName',
    message: 'What would you like to call this application?',
    default: 'myChromeApp'
  },
  {
    name: 'appDescription',
    message: 'How would you like to describe this application?',
    default: 'My Chrome app'
  },
  {
    type: 'checkbox',
    name: 'permissions',
    message: 'Which permissions do you want your app to use?',
    choices: [
      {
        value: 'unlimitedStorage',
        name: 'Storage'
      },
      {
        value: 'identity',
        name: 'Experimental Identity API',
      },
      {
        value: 'webview',
        name: 'Webview'
      },
      {
        value: 'videoCapture',
        name: 'Camera'
      },
      {
        value: 'audioCapture',
        name: 'Microphone'
      },
      {
        value: 'usb',
        name: 'USB'
      },
      {
        value: 'bluetooth',
        name: 'Bluetooth'
      },
      {
        value: 'serial',
        name: 'Serial Port'
      },
      {
        value: 'udpsend',
        name: 'Send UDP data'
      },
      {
        value: 'udpbind',
        name: 'Receive UDP data'
      },
      {
        value: 'tcp',
        name: 'TCP'
      },
      {
        value: 'mediagallery',
        name: 'Media Gallery API'
      }
    ]
  }];

  this.prompt(prompts, function (props) {
    var hasPerm = function (perm) { return props.permissions.indexOf(perm) > -1; };
    this.appFullName = props.appFullName;
    this.appDescription = props.appDescription;

    this.appPermissions.serial = hasPerm('serial');
    this.appPermissions.identity = hasPerm('identity');
    this.appPermissions.unlimitedStorage = hasPerm('unlimitedStorage');
    this.appPermissions.usb = hasPerm('usb');
    this.appPermissions.bluetooth = hasPerm('bluetooth');
    this.appPermissions.webview = hasPerm('webview');
    this.appPermissions.audioCapture = hasPerm('audioCapture');
    this.appPermissions.videoCapture = hasPerm('videoCapture');

    var connections = [];

    if (hasPerm('udpbind')) {
      connections.push('udp-bind::8899');
    }

    if (hasPerm('udpsend')) {
      connections.push('udp-send-to::8899');
    }

    if (hasPerm('tcp')) {
      connections.push('tcp-connect');
    }

    // Complex permission objects
    if (hasPerm('mediagallery'))
      this.appPermissions.mediaGalleries = { 'mediaGalleries': ['read', 'allAutoDetected'] };

    if (connections.length > 0) {
      this.appPermissions.socket = { 'socket': connections };
    }

    cb();
  }.bind( this ));
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
  var data = this.buildData();

  this.directory('images', 'app/images');
  this.directory('scripts', 'app/scripts');
  this.directory('styles', 'app/styles');
  this.template('index.html', 'app/index.html', data);
  this.template('manifest.json', 'app/manifest.json', data);
  this.template('_locales/en/messages.json', 'app/_locales/en/messages.json', data);
};

ChromeAppGenerator.prototype.buildData = function buildData() {
  var experimental = {
    bluetooth: true,
    usb: true,
    identity: true
  };

  // Using object to maintain complex objects rather than strings.
  var complex = {
    socket: true,
    mediaGalleries: true
  };

  var permissions = [];
  var usesExperimental = false;
  var complexPermissions = [];

  for (var permission in this.appPermissions) {
    if (!this.appPermissions[permission]) {
      continue;
    }

    if (experimental[permission]) {
      usesExperimental = true;
    }

    if (complex[permission]) {
      complexPermissions.push(this.appPermissions[permission]);
      continue;
    }

    permissions.push(permission);
  }

  if (usesExperimental) {
    permissions.push('experimental');
  }

  var data = {
    appFullName: this.appFullName,
    appDescription: this.appDescription,
    appPermissions: permissions
  };

  if (complexPermissions.length > 0) {
    for (var p = 0; permission = complexPermissions[p]; p ++) {
      // Complex permissions aren't keyed off the name, remove it.
      delete data.appPermissions[permission];
      data.appPermissions.push(permission);
    }
  }

  return data;
};
