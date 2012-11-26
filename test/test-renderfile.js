var assert = require("assert");
var Generator = require("../all");
var grunt = require("grunt");
var path = require("path");

var render = function(source, data) {
  return grunt.template.process(grunt.file.read(path.join('all', 'templates', 'app', source)), data);
};


describe("Generator", function() {
  describe("#buildData", function() {
    it("should contain no permissions when none asked for", function() {  
       var g = new Generator();
       
       var manifest = g.buildData();
       assert.equal(0, manifest.appPermissions.length);
    });

    it("should populate appFullName when user provides a name", function() {  
       var g = new Generator();
       g.appFullName = "test1234";
       
       var manifest = g.buildData();
       assert.equal("test1234", manifest.appFullName);
    });

    it("should populate appDescription when user provides a description", function() {  
       var g = new Generator();
       g.appDescription = "test1234";
       
       var manifest = g.buildData();
       assert.equal("test1234", manifest.appDescription);
    });

    it("should set unlimitedStoragePermission when developer wants unlimitedStorage", function() {  
       var g = new Generator();
       g.appPermissions = {}; 
       g.appPermissions.unlimitedStorage = true;
       
       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.equal(0, manifestObj.indexOf("unlimitedStorage"));
       assert.equal(1, manifestObj.length);
    });
 
    it("should set identity permission when developer wants identity", function() {  
       var g = new Generator();
       g.appPermissions = {}; 
       g.appPermissions.identity = true;
       
       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.notEqual(-1, manifestObj.indexOf("identity"));
       assert.notEqual(-1, manifestObj.indexOf("experimental"));
       assert.equal(2, manifestObj.length);
    });
  
    it("should not set identity permission when developer doesn't want identity", function() {  
       var g = new Generator();
       g.appPermissions = {}; 
       g.appPermissions.identity = false;
       
       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.equal(-1, manifestObj.indexOf("identity"));
       assert.equal(-1, manifestObj.indexOf("experimental"));
       assert.equal(0, manifestObj.length);
    });

    it("should set usb permission when developer wants usb", function() {  
       var g = new Generator();
       g.appPermissions = {}; 
       g.appPermissions.usb = true;
       
       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.notEqual(-1, manifestObj.indexOf("usb"));
       assert.notEqual(-1, manifestObj.indexOf("experimental"));
       assert.equal(2, manifestObj.length);
    });
  
    it("should not set usb permission when developer doesn't want usb", function() {  
       var g = new Generator();
       g.appPermissions = {}; 
       g.appPermissions.usb = false;
       
       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.equal(-1, manifestObj.indexOf("usb"));
       assert.equal(-1, manifestObj.indexOf("experimental"));
       assert.equal(0, manifestObj.length);
    });

   it("should set mediaGalleries permission when developer wants mediaGalleries API", function() {  
       var g = new Generator();
       g.appPermissions = {}; 

       /// turns out we can't set the params so we need to assume that params parser is correct
       g.appPermissions.mediaGalleries = { "mediaGalleries" : ["read", "allAutoDetected"] };
       
       var manifest = g.buildData();
       var manifestObj = manifest.appPermissions;
       assert.notEqual(false, !!manifestObj[0].mediaGalleries);
       assert.notEqual(-1, manifestObj[0].mediaGalleries.indexOf("read"));
       assert.notEqual(-1, manifestObj[0].mediaGalleries.indexOf("allAutoDetected"));
       assert.equal(1, manifestObj.length);
    });
  }); 

  describe("#createManifest", function() {
    it("should have an empty permissions array when no permissions are set", function() {
      var manifest = JSON.parse(render("manifest.json", { appPermissions:[] }))
      assert.equal(0, manifest.permissions.length);
    });
    
    // These only really test the template generation
    it("should populate appName.message when appFullname is given", function() {
      var data = {
        appFullName: "Paul1",
        appDescription: "TEST"
      }
      var manifest = JSON.parse(render(path.join("_locales", "en", "messages.json"), data))
      assert.equal("Paul1", manifest.appName.message);
    });
    
    it("should populate appDescription.message when appDescription is given", function() {
      var data = {
        appFullName: "TEST",
        appDescription: "PauL is Awesome"
      }
      var manifest = JSON.parse(render(path.join("_locales", "en", "messages.json"), data))
      assert.equal("PauL is Awesome", manifest.appDescription.message);
    });

    it("should populate permissions array with 'unlimitedStorage' when 'unlimitedStoraage' is given", function() {
      var data = {
        appPermissions: ["unlimitedStorage"] 
      }
      var manifest = JSON.parse(render("manifest.json", data));
      assert.equal(0, manifest.permissions.indexOf("unlimitedStorage"));
      assert.equal(1, manifest.permissions.length);
    });

    it("should populate permissions array with 'identity' and 'experimental'  when 'identity' is given", function() {
      var data = {
        appPermissions: ["identity", "experimental"] 
      }
      var manifest = JSON.parse(render("manifest.json", data));
      assert.notEqual(-1, manifest.permissions.indexOf("identity"));
      assert.notEqual(-1, manifest.permissions.indexOf("experimental"));
      assert.equal(2, manifest.permissions.length);
    });

    it("should populate permissions array with 'usb' and 'experimental'  when 'usb' is given", function() {
      var data = {
        appPermissions: ["usb", "experimental"] 
      }
      var manifest = JSON.parse(render("manifest.json", data));
      assert.notEqual(-1, manifest.permissions.indexOf("usb"));
      assert.notEqual(-1, manifest.permissions.indexOf("experimental"));
      assert.equal(2, manifest.permissions.length);

    });

    it("should populate permissions array with 'mediaGalleries' object  when 'mediaGalleries' is given", function() {
      var data = {
        appPermissions: [ { "mediaGalleries" : ["read", "allAutoDetected"] } ]
      }
      var manifest = JSON.parse(render("manifest.json", data));
      assert.equal(2, manifest.permissions[0].mediaGalleries.length);
      assert.notEqual(-1, manifest.permissions[0].mediaGalleries.indexOf("read"));
      assert.notEqual(-1, manifest.permissions[0].mediaGalleries.indexOf("allAutoDetected"));
      assert.equal(1, manifest.permissions.length);
    });

 });
});
