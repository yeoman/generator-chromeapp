/**
 * Manifest for Chrome apps and extension. Please follow for the details.
 *
 * Chrome apps: http://developer.chrome.com/apps/declare_permissions.html
 * Chrome extension: http://developer.chrome.com/extensions/declare_permissions.html
 *
 */

var Permissions = {
  'adview': {
    availability: 'app',
    status: 'undocumented'
  },
  'alarms': {
    availability: 'both'
  },
  'activeTab': {
    availability: 'extension'
  },
  'app.runtime': {
    availability: 'app'
  },
  'app.window': {
    availability: 'app'
  },
  'audio': {
    availability: 'app',
    status: 'dev'
  },
  'audioCapture': {
    availability: 'app'
  },
  'background': {
    availability: 'extension'
  },
  'bluetooth': {
    availability: 'app',
    status: 'dev'
  },
  'bookmarks': {
    availability: 'extension'
  },
  'browsingData': {
    availability: 'extension'
  },
  'clipboardRead': {
    availability: 'both'
  },
  'clipboardWrite': {
    availability: 'both'
  },
  'contentSettings': {
    availability: 'extension'
  },
  'contextMenus': {
    availability: 'both'
  },
  'cookies': {
    availability: 'extension'
  },
  'debugger': {
    availability: 'extension'
  },
  'declarativeContent': {
    availability: 'extension',
    status: 'dev'
  },
  'declarativeWebRequest': {
    availability: 'extension',
    status: 'dev'
  },
  'desktopCapture': {
    availability: 'both',
    status: 'dev'
  },
  'diagnostics': {
    availability: 'app',
    status: 'undocumented'
  },
  'dns': {
    availability: 'both',
    status: 'undocumented'
  },
  'experimental': {
    availability: 'both'
  },
  'fileBrowserHandler': {
    availability: 'both',
    field: {
      'file_browser_handlers': {
        'id': 'upload',
        'default_title': 'File browser',
        'file_filters': [
          'filesystem:*.*'
        ]
      }
    }
  },
  'fileSystem': {
    availability: 'app',
    permission: {
      'fileSystem': ['write', 'retainEntries', 'directory']
    }
  },
  'fontSettings': {
    availability: 'extension'
  },
  'fullscreen': {
    availability: 'app'
  },
  'geolocation': {
    availability: 'both'
  },
  'history': {
    availability: 'extension'
  },
  'identity': {
    availability: 'both'
  },
  'idle': {
    availability: 'both'
  },
  'idltest': {
    availability: 'extension',
    status: 'undocumented'
  },
  'infobars': {
    availability: 'both',
    status: 'dev',
    resource: {
      'icons': {'48': 'images/icon-48.png'}
    }
  },
  'location': {
    availability: 'both',
    status: 'dev'
  },
  'management': {
    availability: 'extension'
  },
  'mediaGalleries': {
    availability: 'app',
    permission: {
      'mediaGalleries': ["read", "copyTo", "allAutoDetected"]
    }
  },
  'notifications': {
    availability: 'both',
    resource: {
      'web_accessible_resources': 'images/icon-48.png'
    }
  },
  'pageCapture': {
    availability: 'extension'
  },
  'pointerLock': {
    availability: 'app'
  },
  'power': {
    availability: 'app'
  },
  'privacy': {
    availability: 'extension'
  },
  'processes': {
    availability: 'extension',
    status: 'dev'
  },
  'proxy': {
    availability: 'extension'
  },
  'pushMessaging': {
    availability: 'both'
  },
  'serial': {
    availability: 'app'
  },
  'sessions': {
    availability: 'extension',
    status: 'dev'
  },
  'signedInDevices': {
    availability: 'both',
    status: 'dev'
  },
  'socket': {
    availability: 'app'
  },
  'storage': {
    availability: 'both'
  },
  'syncFileSystem': {
    availability: 'app'
  },
  'system.cpu': {
    availability: 'app',
    status: 'dev'
  },
  'system.display': {
    availability: 'both'
  },
  'system.memory': {
    availability: 'both',
    status: 'dev'
  },
  'system.storage': {
    availability: 'both'
  },
  'tabCapture': {
    availability: 'extension',
    status: 'dev'
  },
  'tabs': {
    availability: 'extension'
  },
  'topSites': {
    availability: 'extension'
  },
  'tts': {
    availability: 'both'
  },
  'ttsEngine': {
    availability: 'extension',
    field: {
      'voices': [{
        'voice_name': 'Alice',
        'lang': 'en-US',
        'gender': 'female',
        'event_types': ['start', 'marker', 'end']
      }]
    }
  },
  'unlimitedStorage': {
    availability: 'both'
  },
  'usb': {
    availability: 'app'
  },
  'videoCapture': {
    availability: 'app'
  },
  'wallpaper': {
    availability: 'app',
    status: 'undocumented'
  },
  'webNavigation': {
    availability: 'extension'
  },
  'webRequest': {
    availability: 'extension'
  },
  'webRequestBlocking': {
    availability: 'extension'
  },
  'webview': {
    availability: 'app'
  }
};


var manifest = module.exports = function manifest(generator, options) {
  this.generator = generator;
  this._ = generator._;
  this.chromeVersion = 'chrome30';
  this.fields = {
    'name': '__MSG_appName__',
    'description': '__MSG_appDescription__',
    'version': '1',
    'manifest_version': 2,
    'default_locale': 'en',
    'permissions': []
  };

  this.fields = this._.merge(this.fields, options);
  return this;
};

// Load manifest fileds from file
manifest.prototype.load = function load(dest) {
  var path = require('path');
  var fs = require('fs');

  dest = path.join(process.cwd(), dest);
  if (fs.existsSync(dest)) {
    var fields = this.generator.read(dest);
    if (fields)
      this.fields = this._.merge(this.fields, JSON.parse(fields));
  }
};

// Get a permission list by type and option
manifest.prototype.getPermissions = function(type, opt) {
  return this._.pick(Permissions, function(i, key) {
    return (i.availability === 'both' || i.availability === type) &&
      (opt.dev ? i.status !== 'undocumented' : i.status === undefined) &&
      (opt.filter ? (this._.indexOf(this.fields.permissions, key) === -1) : true);
  }.bind(this));
};

// Set a permissions with new permission
manifest.prototype.setPermissions = function(newPerms) {
  var omitPermissions = ['socket'];
  this._.each(newPerms, function(newPerm) {
    if (this._.intersection(omitPermissions, [newPerm]).length !== 0)
      return;

    var perm = this._.isString(newPerm) ? Permissions[newPerm] : newPerm;
    if (perm) {
      this.fields.permissions = this._.union(this.fields.permissions, perm.permission ? perm.permission : newPerm);
      if (perm.field) {
        this._.merge(this.fields, perm.field);
      }
      if (perm.resource) this._.merge(this.fields, perm.resource);
    }
  }.bind(this));
};

// Return stringified manifest
manifest.prototype.stringify = function() {
  return JSON.stringify(this.fields, null, '\t').replace(/\n/g, '\n  ');
};

manifest.prototype.getMorePermissionPrompts = function(opt) {
  var prompt = [];

  // Set more prompt if user wanna input custom match patterns
  if (this._.indexOf(opt, 'customPattern') !== -1) {
    prompt.push({
      type: 'input',
      name: 'customPattern',
      message: 'Input a match patterns with comma-separated',
      filter: function(val) {
        return val.length > 0 ? {'permission': val.replace(/\s+/, '').split(',')} : undefined;
      }
    });
  }

  // Set more prompt if socket permission has selected
  if (this._.indexOf(opt, 'socket') !== -1) {
    prompt.push({
      type: 'input',
      name: 'socketPermission',
      message: 'Input a socket rules with comma-separated',
      default: 'tcp-listen:*:*, tcp-connect:*:*',
      filter: function(val) {
        return {'permission': {'socket': val.replace(/\s+/, '').split(',')}};
      }
    });
  }

  return prompt;
}

manifest.prototype.getHostPermissionPrompts = function(type) {
  var hostPermission = [{
    type: 'checkbox',
    name: 'hostPermission',
    message: 'Select match patterns to add',
    choices: [{
      name: 'HTTP scheme. `http://*/*, https://*/*`',
      value: 'httpScheme',
    }, {
      name: 'All of permitted schem. `<all_urls>`',
      value: 'allURLs',
    }, {
      name: 'HTTP scheme and is on the host 127.0.0.1',
      value: 'localhost'
    }, {
      name: 'Input a custom match patterns',
      value: 'customPattern'
    }]
  }];

  if (type === 'extension') {
    hostPermission.push({
      name: 'Matches any URL pointing to an extension. `chrome-extension://*/*`',
      value: 'extensionScheme'
    });
  }

  return hostPermission;
};

manifest.prototype.getPermissionPrompts = function(type, opt) {
  return {
    type: 'checkbox',
    name: 'permissions',
    message: 'Select a permissions for the ' + type,
    paginated : true,
    choices: this._.keys(this.getPermissions(type, opt))
  };
};

// Asks for permissions
manifest.prototype.askForPermissions = function(type, opt) {
  var cb = this.generator.async();
  var prompt = this.generator.prompt;
  var manifest = this;
  var _ = this._;
  var morePermission = [];
  var devFeaturesPrompt = {
    name: 'devFeatures',
    type: 'confirm',
    message: 'Would you like to use the dev features?',
    default: false
  };

  prompt(devFeaturesPrompt, function(answers) {

    opt.devFeatures = answers.devFeatures;

    prompt(manifest.getPermissionPrompts(type, opt), function (answers) {
      // Update a permissions to manifest fields
      manifest.setPermissions(answers.permissions);

      if (_.indexOf(answers.permissions, 'socket') !== -1)
        morePermission.push('socket');

      prompt(manifest.getHostPermissionPrompts(type), function (answers) {
        var host = {permissions: []};
        var schemes = answers.hostPermission;

        function hasScheme(scheme) {return schemes.indexOf(scheme) !== -1;};

        // Push each match patterns to permissions of manifest
        if (hasScheme('httpScheme')) {
          host.permissions.push('http://*/*');
          host.permissions.push('https://*/*');
        }

        if (hasScheme('allURLs'))
          host.permissions.push('<all_urls>');

        if (hasScheme('localhost'))
          host.permissions.push('http://127.0.0.1/*');

        if (hasScheme('extensionScheme'))
          host.permissions.push('chrome-extension://*/*');

        if (hasScheme('customPattern'))
          morePermission.push('customPattern');

        // Update a host permissions to manifest fields
        manifest.setPermissions(host);

        // Ask host permissions and more
        prompt(manifest.getMorePermissionPrompts(morePermission), function (answers) {
          manifest.setPermissions(answers.socketPermission);
          manifest.setPermissions(answers.customPattern);
          cb();
        });
      });
    });
  });
};
