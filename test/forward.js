var path = require('path');
var url = require('url');
var util = require('./support/util');
var targetServer = require('./support/target-server');
var proxyServer = require('../');
var replaceListPath = path.join(__dirname, 'support', 'replace-list.js');

describe('nproxy', function(){
  var tHttpServer; // target server
  var tHttpsServer;
  var servers;
  var pHttpServer; // proxy server
  var pHttpsServer;

  before(function(done){
    tHttpServer = targetServer.createHttpServer();
    tHttpsServer = targetServer.createHttpsServer();
    servers = proxyServer(8989, {
      responderListFilePath: replaceListPath
    });
    pHttpServer = servers.httpServer;
    pHttpsServer = servers.httpsServer;
    done();
  });

  describe('.forward', function(){
    /**
     * http
     */
    it('should forward non-replaced css file via get under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/request?type=css',
      }, function(res){
        res.statusCode.should.equal(200);
        res.headers['content-type'].should.equal('text/css');
        res.headers['server'].should.equal('Target-HTTP-Server');
        done();
      });
    });

    it('should forward non-replaced post request under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/request?type=form',
        method: 'POST',
        data: '{"username": "goddy", "password": "123"}'
      }, function(res){
        res.statusCode.should.equal(301);
        res.headers['server'].should.equal('Target-HTTP-Server');
        done();
      });
    });

    it('should forward non-replaced request with cookies under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/request?type=cookie',
        method: 'POST',
        headers: {
          'Cookie': 'username=goddy;password=123'
        }
      }, function(res){
        res.statusCode.should.equal(200);
        res.headers['server'].should.equal('Target-HTTP-Server');
        done();
      });
    });

    /**
     * https
     */
    it('should forward non-replaced css file via get under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/request?type=css',
      }, function(res){
        res.statusCode.should.equal(200);
        res.headers['content-type'].should.equal('text/css');
        res.headers['server'].should.equal('Target-HTTPS-Server');
        done();
      });
    });

    it('should forward non-replaced post request under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/request?type=form',
        method: 'POST',
        data: '{"username": "goddy", "password": "123"}'
      }, function(res){
        res.statusCode.should.equal(301);
        res.headers['server'].should.equal('Target-HTTPS-Server');
        done();
      });
    });

    it('should forward non-replaced request with cookies under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/request?type=cookie',
        method: 'POST',
        headers: {
          'Cookie': 'username=goddy;password=123'
        }
      }, function(res){
        res.statusCode.should.equal(200);
        res.headers['server'].should.equal('Target-HTTPS-Server');
        done();
      });
    });

  });

  after(function(done){
    tHttpServer.close();
    tHttpsServer.close();

    pHttpServer.close();
    pHttpsServer.close();
    done();
  });
});