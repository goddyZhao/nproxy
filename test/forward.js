var path = require('path');
var http = require('http');
var url = require('url');
var util = require('./support/util');
var targetServer = require('./support/target-server');
var proxyServer = require('../');
var replaceListPath = path.join(__dirname, 'support', 'replace-list.js');

describe('nproxy', function(){
  var tServer; // target server
  var pServer; // proxy server

  before(function(done){
    tServer = targetServer();
    pServer = proxyServer(8989, replaceListPath);
    done();
  });

  describe('.forward', function(){
    it('should forward non-replaced css file', function(done){
      util.request({
        url: 'http://localhost:3001/request?type=css'
      }, function(res){
        res.statusCode.should.equal(200);
        res.headers['content-type'].should.equal('text/css');
        res.headers['server'].should.equal('Target-Server');
        done();
      });
    });
  });

  after(function(done){
    tServer.close();
    pServer.close();
    done();
  });
});