# Chrome App generator [![Build Status](https://secure.travis-ci.org/yeoman/generator-chromeapp.png?branch=master)](http://travis-ci.org/yeoman/generator-chromeapp)

> A Chrome Apps boilerplate generator that creates everything you need to get started with development. To test, go to: chrome://extensions, enable Developer mode and load `app` as an unpacked extension.

Maintainer: [Paul Kinlan](https://github.com/PaulKinlan)


## Getting Started

Install: `npm install -g generator-chromeapp`

Usage: `yo chromeapp`

## Generators

Available generators:

* [chromeapp](#app) (aka [chromeapp:app](#app))
* [chromeapp:permission](#permission)

## App
Sets up a new Chrome app, generating all the boilerplate you need to get started.

Example: 
```bash
yo chromeapp
```

## Permission
Generates and append a chromeapp permission to manifest.json.

Example: 
```bash
yo chromeapp:permmision
```

## Options

* `--skip-install`

  Skips the automatic execution of `bower` and `npm` after
  scaffolding has finished.

* `--test-framework=[framework]`

  Defaults to `mocha`. Can be switched for
  another supported testing framework like `jasmine`.
  
## Contribute

See the [contributing docs](https://github.com/yeoman/yeoman/blob/master/contributing.md)


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
