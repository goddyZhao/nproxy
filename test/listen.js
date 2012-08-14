var path = require('path');
var targetServer = require('./support/target-server');
var proxyServer = require('../');
var replaceListPath = path.join(__dirname, 'support', 'replace-list.js');

describe('nproxy', function(){
  var server;
  before(function(done){
    server = proxyServer(undefined, replaceListPath);
    done();
  });

  describe('.listen', function(){
    it('should listen on port 8989 by default', function(done){
      done();
    });
  });

  after(function(done){
    server.close();
    done();
  });
});