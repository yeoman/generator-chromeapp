/**
 *
 * Manifest for Chrome apps and extension.
 * For more details, please follow the link below.
 *
 * Chrome apps: http://developer.chrome.com/apps/declare_permissions.html
 * Chrome extension: http://developer.chrome.com/extensions/declare_permissions.html
 *
 */

var _ = require('lodash');

var Permissions = {
  'adview': {
    availability: 'app',
    status: 'dev'
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
    status: 'dev'
  },
  'dns': {
    availability: 'both',
    status: 'dev'
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
  'gcm': {
    availability: 'app',
    status: 'dev'
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
      'mediaGalleries': ['read', 'copyTo', 'allAutoDetected']
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
    availability: 'app',
    permission: {
      'socket': []
    }
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
    status: 'dev'
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

// Constructor of manifest
var manifest = module.exports = function Manifest(fields) {
  this.fields = _.merge({
    'name': '__MSG_appName__',
    'description': '__MSG_appDescription__',
    'version': '1',
    'manifest_version': 2,
    'default_locale': 'en',
    'permissions': []
  }, fields);

  return this;
};

// Get a permission list by name, type and option
manifest.query = function(opt) {
  return _.pick(Permissions, function(i, key) {
    if (opt.name) {
      return (opt.name === key)
    } else {
      return (i.availability === 'both' || i.availability === opt.type) &&
      (opt.devFeatures || i.status !== 'dev')
    }
  }.bind(this));
};

// Set a new permissions
manifest.prototype.setPermissions = function(newPerms) {
  var permissions = [];

  _.each(newPerms, function(newPerm) {
    // Determine which type of new permission
    var permDesc = _.isString(newPerm) ? Permissions[newPerm] : _.isObject(newPerm) && newPerm;

    // Add new permission list to merge
    permissions.push(permDesc && permDesc.permission ? permDesc.permission : newPerm);

    // Merge field and resource
    if (permDesc) {
      if (permDesc.field) {
        _.merge(this.fields, permDesc.field);
      }

      if (permDesc.resource) {
        _.merge(this.fields, permDesc.resource);
      }
    }
  }.bind(this));

  // Merge a new permissions
  this.fields.permissions = _.union(this.fields.permissions, permissions);
}

// Return stringified manifest
manifest.prototype.stringify = function() {
  return JSON.stringify(this.fields, null, '\t').replace(/\n/g, '\n  ');
};
