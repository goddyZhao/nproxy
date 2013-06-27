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
    var tHttpServer;
    var tHttpsServer;
    var servers;
    var pHttpServer;
    var pHttpsServer;

    before(function(done){
      tHttpServer = targetServer.createHttpServer();
      tHttpsServer = targetServer.createHttpsServer();
      servers = proxyServer(8989, {
        responderListFilePath: replaceListPath,
        debug: true
      });
      pHttpServer = servers.httpServer;
      pHttpsServer = servers.httpsServer;
      done();
    });

    /**
     * http
     */
    it('should respond a local file according to a string pattern under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/a.css'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('ar.css');
          done();
        });
      });
    });

    it('should respond a local file according to a regular express pattern under http', function(done){
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

    it('should respond local combo file with array responder under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/combined.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('c1.js\nc2.js\n');
          done();
        });
      });
    });

    it('should respond local combo file with object responder under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/combined2.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('c3.js\nc4.js\n');
          done();
        });
      });
    });

    it('should map remote dir to local one with img under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/img/avatar_dev.jpg'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          res.headers['content-type'].should.equal('image/jpeg');
          done();
        });
      })
    });

    it('should map remote dir to local one with js or css under http', function(done){
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

    it('should map remote dir to local one with js or css with query string under http', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/web/js/hello.js?t=1'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          res.headers['content-type'].should.equal('application/javascript');
          buffer.toString().should.equal('hello.js')
          done();
        });
      })
    });

    it('should map remote dir to local one with regular expression', function(done){
      util.request({
        url: 'http://localhost:8989/http://localhost:3001/ui/re/img/avatar.jpg'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          res.headers['content-type'].should.equal('image/jpeg');

          util.request({
            url: 'http://localhost:8989/http://localhost:3001/ui/re/img/avatar2.jpg'
          }, function(res){
            validateResponseHeader(res, function(err, buffer){
              res.headers['content-type'].should.equal('image/jpeg');            
              done();
            });
          });
        });
      });
    });


    /**
     * https
     */
    it('should respond a local file according to a string pattern under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/web/a.css'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('ar.css');
          done();
        });
      });
    });

    it('should respond a local file according to a regular express pattern under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/web/b.css'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('bstar.css');
          
          //send the second request matching the same pattern
          util.request({
            url: 'http://localhost:8989/https://localhost:3002/web/ba.css'
          }, function(res){
            validateResponseHeader(res, function(err, buffer){
              buffer.toString().should.equal('bstar.css');
              done();
            });
          })
        });
      });
    });

    it('should respond local combo file with array responder under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/web/combined.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('c1.js\nc2.js\n');
          done();
        });
      });
    });

    it('should respond local combo file with object responder under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/web/combined2.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          buffer.toString().should.equal('c3.js\nc4.js\n');
          done();
        });
      });
    });

    it('should map remote dir to local one with img under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/web/img/avatar_dev.jpg'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          res.headers['content-type'].should.equal('image/jpeg');
          done();
        });
      })
    });

    it('should map remote dir to local one with js or css under https', function(done){
      util.request({
        url: 'http://localhost:8989/https://localhost:3002/web/js/hello.js'
      }, function(res){
        validateResponseHeader(res, function(err, buffer){
          res.headers['content-type'].should.equal('application/javascript');
          buffer.toString().should.equal('hello.js')
          done();
        });
      })
    });

    after(function(done){
      tHttpServer.close();
      tHttpsServer.close();
      pHttpServer.close();
      pHttpsServer.close();
      done();
    });

  });
});