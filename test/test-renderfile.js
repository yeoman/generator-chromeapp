var assert = require("assert");
var Generator = require("../all");
var grunt = require("grunt");
var path = require("path");

var render = function(source, data) {
  return grunt.template.process(grunt.file.read(path.join('all', 'templates', 'app', source)), data);
};


describe("Generator", function() {
  describe("#buildData", function() {
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

  }); 

  describe("#createManifest", function() {
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
 });
});
