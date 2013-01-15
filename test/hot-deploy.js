var path = require('path');
var fs = require('fs');
var util = require('./support/util')
var targetServer = require('./support/target-server');
var proxyServer = require('../');

var supportDir = path.join(__dirname, 'support');
var replaceListPath = path.join(supportDir, 'replace-list.js');

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
  var servers;
  var tHttpServer;
  var pHttpServer;
  var pHttpsServer;
  var originRuleContent;

  before(function(done){
    fs.readFile(replaceListPath, function(err, bufferData){
      if(!err){
        originRuleContent = bufferData;

        tHttpServer = targetServer.createHttpServer();
        servers = proxyServer(8989, {
          responderListFilePath: replaceListPath
        });

        pHttpServer = servers.httpServer;
        pHttpsServer = servers.httpsServer;

        done();
      }
    });
   
  });

  it('should support hot deploy of rule file', function(done){
    var changedRuleFile = path.join(supportDir, 'replace-list2.js');

    fs.createReadStream(changedRuleFile)
      .pipe(fs.createWriteStream(replaceListPath))
      .on('close', function(){
        setTimeout(function(){
          util.request({
            url: 'http://localhost:8989/http://localhost:3001/web/hot-deploy.js'
          }, function(res){
            validateResponseHeader(res, function(err, buffer){
              buffer.toString().should.equal('replaced-hot-deploy.js');
              done();
            });
          });
        },7000);
      });
  });

  after(function(done){
    tHttpServer.close();
    pHttpServer.close();
    pHttpsServer.close();
    fs.writeFile(replaceListPath, originRuleContent, function(err){
      if(!err){
        done();
      }
    });
  });
});