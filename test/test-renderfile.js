var assert = require("assert");
var Generator = require("../all");

describe("Generator", function() {
  describe("#buildData", function() {
    it("should populate appFullName when user provides a name", function() {  
       var g = new Generator();
       g.appFullName = "test1234";
       
       var manifest = g.buildData();
       assert.equal("test1234", manifest.appFullName);
    });
  }); 
});
