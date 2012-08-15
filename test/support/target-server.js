var http = require('http');
var url = require('url');
var qs = require('querystring');

function createTargetServer(callback){
  var server = http.createServer(function(req, res){
    var parsedUrl = url.parse(req.url);
    var data = '';
    switch(qs.parse(parsedUrl.query).type){
      case 'css': 
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Server', 'Target-Server');
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
              res.writeHead(301, {'Server': 'Target-Server'});
            }else{
              res.writeHead(404, {'Server': 'Target-Server'});
            }
            res.end();
          })
        }
        break;

      case 'cookie':
        if(req.headers.cookie === 'username=goddy;password=123'){
          res.writeHead(200, {'Server': 'Target-Server'});
        }else{
          res.writeHead(500, {'Server': 'Target-Server'});
        }
        res.end();
        break;

      default:
        res.writeHead(404);
        res.end();
    }

    


  }).listen(3001,'127.0.0.1',callback);

  console.log('Target Server started on 127.0.0.1:3001!');

  return server;
};

module.exports = createTargetServer;
