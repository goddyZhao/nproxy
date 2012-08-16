var path = require('path');
var Buffer = require('buffer').Buffer;
var util = require('./support/util');
var targetServer = require('./support/target-server');
var proxyServer = require('../');
var replaceListPath = path.join(__dirname, 'support', 'replace-list.js');

function validateResponseHeader(res, callback){
  var data = [];

  res.statusCode.should.equal(200);
  res.headers['server'].should.equal('nproxy');

  res.on('data', function(chunk){
    data.push(chunk);
  });

  res.on('end', function(){
    callback(null, Buffer.concat(data));
  });
};

describe('nproxy', function(){
  describe('.respond', function(){
    var tServer;
    var pServer;

    before(function(done){
      tServer = targetServer();
      pServer = proxyServer(8989, {
        responderListFilePath: replaceListPath
      });
      done();
    });

    it('should respond a local file according to a string pattern', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/a.css'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('ar.css');
          done();
        });
      });
    });

    it('should respond a local file according to a regular express pattern', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/b.css'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('bstar.css');
          
          //send the second request matching the same pattern
          util.request({
            url: 'http://localhost:8989/http://localhost:3001/web/ba.css'
          }, function(res){
            validateResponseHeader(res, function(err, buffer){
              buffer.toString().should.equal('bstar.css');
              done();
            });
          })
        });
      });
    });

    it('should respond local combo file with array responder', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/combined.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('c1.js\nc2.js\n');
          done();
        });
      });
    });

    it('should respond local combo file with object responder', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/combined2.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('c3.js\nc4.js\n');
          done();
        });
      });
    });

    it('should map remote dir to local one with img', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/img/avatar_dev.jpg'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          res.headers['content-type'].should.equal('image/jpeg');
          done();
        });
      })
    });

     it('should map remote dir to local one with js or css', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/js/hello.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          res.headers['content-type'].should.equal('application/javascript');
          buffer.toString().should.equal('hello.js')
          done();
        });
      })
    });

    after(function(done){
      tServer.close();
      pServer.close();
      done();
    });

  });
});