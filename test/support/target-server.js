var http = require('http');
var url = require('url');
var qs = require('querystring');

function createTargetServer(callback){
  var server = http.createServer(function(req, res){
    var parsedUrl = url.parse(req.url);
    switch(qs.parse(parsedUrl.query).type){
      case 'css': 
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Server', 'Target-Server');
        res.writeHead(200);
    }

    res.end();


  }).listen(3001,'127.0.0.1',callback);

  console.log('Target Server started on 127.0.0.1:3001!');

  return server;
};

module.exports = createTargetServer;
