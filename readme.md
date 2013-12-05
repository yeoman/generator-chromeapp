# Chrome App generator [![Build Status](https://secure.travis-ci.org/yeoman/generator-chromeapp.png?branch=master)](http://travis-ci.org/yeoman/generator-chromeapp)

Maintainer: [Jimmy Moon](https://github.com/ragingwind)

> A Chrome Apps boilerplate generator that creates everything you need to get started with development. To test, go to: chrome://extensions, enable Developer mode and load `app` as an unpacked extension.

## Getting Started

- First make a new directory, and `cd` into it: mkdir my-new-chromeapp && cd $_
- Install the generator: `npm install -g generator-chromeapp`
- Run: `yo chromeapp`

## Generators

Available generators:

* [chromeapp](#app) (aka [chromeapp:app](#app))
* [chromeapp:permission](#permission)
* [chromeapp:samples](#sample)

## App

![](http://i.imgur.com/vh7uo4X.gif)

Sets up a new Chrome App, generating all the boilerplate you need to get started.

Example: 
```bash
yo chromeapp
```

## Permission

![](http://i.imgur.com/O6LrhEB.png)

Create manifest.json or append permission into manifest.json. You can choose permission to put into manifest.json

Example: 
```bash
yo chromeapp:permmision
```

## Samples

![](http://i.imgur.com/OgPhpfA.gif)

You can create a new Chrome App by the [google-chrome-app samples](https://github.com/GoogleChrome/chrome-app-samples) on github repository.

Example: 
```bash
yo chromeapp:samples
```

## Supported commands

* `grunt build` - creates a production build, package production files to zip file

* `grunt debug` - LiveReload/edit your Chrome App.

![](http://i.imgur.com/DGxbvBY.gif)

## Options

* `--skip-install`

  Skips the automatic execution of `bower` and `npm` after
  scaffolding has finished.

* `--test-framework=[framework]`

  Defaults to `mocha`. Can be switched for
  another supported testing framework like `jasmine`.

* `--skip-pull`
  
  Skips to `pull` command of `git` to check the [google-chrome-app samples](https://github.com/GoogleChrome/chrome-app-samples) on github repository

## Contribute

See the [contributing docs](https://github.com/yeoman/yeoman/blob/master/contributing.md)


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
