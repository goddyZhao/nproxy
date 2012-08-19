var http = require('http');
var https = require('https');
var net = require('net');
var connect = require('connect');
var fs = require('fs');
var nm = require('./middlewares'); //nproxy middles
var path = require('path');
var log = require('./log');

var url = require('url');

var DEFAULT_PORT = 8989;
var INTERNAL_HTTPS_PORT = 8000;
var app;
var httpServer;
var httpsServer;
var privateKeyFile = path.join(__dirname, '..', 'keys', 'privatekey.pem');
var certificateFile = path.join(__dirname, '..', 'keys', 'certificate.pem');

/**
 * Start up nproxy server on the specified port
 * and combine the processors defined as connect middlewares into it.
 * 
 * @param {String} port the port proxy server will listen on
 * @param {Object} options options for the middlewares
 */
function nproxy(port, options){

  port = typeof port === 'number' ? port : DEFAULT_PORT;

  app = connect();
  // server.use(connect.bodyParser());
  if(typeof options.responderListFilePath !== 'undefined'){
    app.use(nm.respond(options.responderListFilePath));
  }
  // app.use(nm.forward());
  app.use(function(req, res){
    handle_request(req, res, 'https');
  });

  httpServer = http.createServer(function(req, res){
    req.type = 'http';
    app(req, res);
  }).listen(port);
  httpsServer = https.createServer({
    key: fs.readFileSync(privateKeyFile),
    cert: fs.readFileSync(certificateFile)
  }, function(req, res){
    req.type = 'https';
    app(req, res);
  }).listen(INTERNAL_HTTPS_PORT);

  proxyHttps();

  log.info('nproxy started on ' + port + '!');
  
  return {
    httpServer: httpServer,
    httpsServer: httpsServer
  }
}

var process_url = function(request, type, processor) {
  console.log('request url: ', request.url);
  var req_url = url.parse(request.url, true);
  if(!req_url.protocol) req_url.protocol = type + ":";
  if(!req_url.hostname) req_url.hostname = request.headers.host;

  return req_url;
}

var handle_request = function(request, response, type) {
  var req_url   = process_url(request, type);
  var hostname  = req_url.hostname;
  var pathname  = req_url.pathname + ( req_url.search || "");

  console.log(type + " proxying to " +  url.format(req_url));

  var request_options = {
      host: hostname
    , port: req_url.port || (type == "http" ? 80 : 443)
    , path: pathname
    , headers: request.headers
    , method: request.method
  }

  var proxy_request = (req_url.protocol == "https:" ? https : http).request(request_options, function(proxy_response) {

    proxy_response.on("data", function(d) {
      response.write(d);
    });

    proxy_response.on("end", function() {
      response.end();
      // if(that.options.proxy_write) proxy_writter.end();
      // if(processor) processor.emit("response_end");
    })

    proxy_response.on('close', function() {
      // if(processor) processor.emit("response_close");
      // proxy_response.connection.end();
    })

    proxy_response.on("error", function(err) {})
    response.writeHead(proxy_response.statusCode, proxy_response.headers);
  })

  proxy_request.on('error', function(err) {
    response.end(); 
  })

  request.on('data', function(d) {
    proxy_request.write(d, 'binary');
  });

  request.on('end', function() {
    proxy_request.end();
  });

  request.on('close', function() {
    proxy_request.connection.end();
  })

  request.on('error', function(exception) { 
    response.end(); 
  });
}


/**
 * Listen the CONNECTION method and forward the https request to internal https server
 */
function proxyHttps(){
  httpServer.on('connect', function(req, socket, upgradeHead){ 
    var netClient = net.createConnection(INTERNAL_HTTPS_PORT);

    netClient.on('connect', function(){
      console.log('connect to https server successfully!');
      socket.write( "HTTP/1.0 200 Connection established\r\nProxy-agent: Netscape-Proxy/1.1\r\n\r\n"); 
    });

    socket.on('data', function(chunk){
      netClient.write(chunk);
    });
    socket.on('end', function(){
      netClient.end();
    });
    socket.on('close', function(){
      netClient.end();
    });
    socket.on('error', function(err){
      log.error('socket error ' + err.message);
      netClient.end();
    });

    netClient.on('data', function(chunk){
      socket.write(chunk);
    });
    netClient.on('end', function(){
      socket.end();
    });
    netClient.on('close', function(){
      socket.end();
    });
    netClient.on('error', function(){
      log.error('netClient error ' + err.message);
      socket.end();
    });

  });
}

process.on('uncaughtException', function(err){
  log.error('uncaughtException: ' + err.message);
});

nproxy(8989,{});

module.exports = nproxy;