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

util.inherits(ChromeAppGenerator, yeoman.generators.NamedBase);

ChromeAppGenerator.prototype.askFor = function askFor(argument) {
  var cb = this.async();

  var prompts = [{
    name: 'appFullName',
    message: 'What would you like to call this application?',
    default: 'myChromeApp',
    warning: 'You can change the default application name.'
  },
  {
    name: 'appDescription',
    message: 'How would you like to describe this application?',
    default: 'My Chrome app',
    warning: 'You can change the default app description.'
  },
  {
    name: 'unlimitedStoragePermission',
    message: 'Would you like to use Storage in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'identityPermission',
    message: 'Would you like to the experimental Identity API in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'webviewPermission',
    message: 'Would you like to use the webview in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'videoCapturePermission',
    message: 'Would you like to use the Camera in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'audioCapturePermission',
    message: 'Would you like to use the Microphone in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'usbPermission',
    message: 'Would you like to use USB in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'bluetoothPermission',
    message: 'Would you like to use Bluetooth in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'serialPermission',
    message: 'Would you like to use the Serial Port in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'udpsendPermission',
    message: 'Would you like to send UDP data in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'udpbindPermission',
    message: 'Would you like to receive UDP data in your app',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'tcpPermission',
    message: 'Would you like to use TCP in your app?',
    default: 'Y/n',
    warning: 'You can change the permissions'
  },
  {
    name: 'mediagalleryPermission',
    message: 'Would you like to use the Media Gallery API in your app?',
    default: 'Y/n',
    warning: 'You can change the permissions'
  }];

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit( 'error', err );
    }

    this.appFullName = props.appFullName;
    this.appDescription = props.appDescription;
    this.appPermissions.serial = (/y/i).test(props.serialPermission);
    this.appPermissions.identity = (/y/i).test(props.identityPermission);
    this.appPermissions.unlimitedStorage = (/y/i).test(props.unlimitedStoragePermission);
    this.appPermissions.usb = (/y/i).test(props.usbPermission);
    this.appPermissions.bluetooth = (/y/i).test(props.bluetoothPermission);
    this.appPermissions.webview = (/y/i).test(props.webviewPermission);
    this.appPermissions.audioCapture = (/y/i).test(props.audioCapturePermission);
    this.appPermissions.videoCapture = (/y/i).test(props.videoCapturePermission);

    var connections = [];

    if ((/y/i).test(props.udpbindPermission)) {
      connections.push('udp-bind::8899');
    }

    if ((/y/i).test(props.udpsendPermission)) {
      connections.push('udp-send-to::8899');
    }

    if ((/y/i).test(props.tcpPermission)) {
      connections.push('tcp-connect');
    }

    // Complex permission objects
    if ((/y/i).test(props.mediagalleryPermission))
      this.appPermissions.mediaGalleries = { 'mediaGalleries': ['read', 'allAutoDetected'] };

    if (connections.length > 0) {
      this.appPermissions.socket = { 'socket': connections };
    }

    cb();
  }.bind( this ));
};

ChromeAppGenerator.prototype.packages = function packages() {
  this.copy('_package.json', 'package.json');
  this.copy('_component.json', 'component.json');
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
  this.template('index.html', 'app/index.html', data);
  this.template('manifest.json', 'app/manifest.json', data);
  this.template('_locales/en/messages.json', 'app/_locales/en/messages.json', data);
};

ChromeAppGenerator.prototype.buildData = function buildData() {
  var experimental = {
    'bluetooth' : true,
    'usb': true,
    'identity': true
  };

  // Using object to maintain complex objects rather than strings.
  var complex = {
    'socket': true,
    'mediaGalleries': true
  };

  var permissions = [];
  var usesExperimental = false;
  var complexPermissions = [];

  for (var permission in this.appPermissions) {
    if (!!this.appPermissions[permission] === false) {
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
