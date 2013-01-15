var http = require('http');
var https = require('https');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var path = require('path');

function handle(req, res){
  var parsedUrl = url.parse(req.url);
  var data = '';
  var serverHeader = req.type === 'http' ? 'Target-HTTP-Server' : 'Target-HTTPS-Server';
  switch(qs.parse(parsedUrl.query).type){
    case 'css': 
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Server', serverHeader);
      res.writeHead(200);
      res.end();
      break;

    case 'form':
      if(req.method === 'POST'){

        req.on('data', function(chunk){
          data += chunk;
        })
        
        req.on('end', function(){
          data = JSON.parse(data);
          if(data.username === 'goddy' && data.password === '123'){
            res.writeHead(301, {'Server': serverHeader});
          }else{
            res.writeHead(404, {'Server': serverHeader});
          }
          res.end();
        })
      }
      break;

    case 'cookie':
      if(req.headers.cookie === 'username=goddy;password=123'){
        res.writeHead(200, {'Server': serverHeader});
      }else{
        res.writeHead(500, {'Server': serverHeader});
      }
      res.end();
      break;

    default:
      res.writeHead(404);
      res.end();
  }
}

function createHttpServer(callback){
  var server = http.createServer(function(req, res){
    req.type = 'http';
    handle(req, res);
  }).listen(3001,'127.0.0.1',callback);

  console.log('Target Http Server started on 127.0.0.1:3001!');

  return server;
};

function createHttpsServer(callback){
  var server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'keys', 'privatekey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'keys', 'certificate.pem'))
  },function(req, res){
    req.type = 'https';
    handle(req, res);
  }).listen(3002, '127.0.0.1', callback);

  console.log('Target Https Server started on 127.0.0.1:3002!');

  return server;
};

module.exports.createHttpServer = createHttpServer;
module.exports.createHttpsServer = createHttpsServer;
