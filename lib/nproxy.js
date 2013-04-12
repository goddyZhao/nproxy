var http = require('http');
var https = require('https');
var net = require('net');
var connect = require('connect');
var fs = require('fs');
var path = require('path');
var log = require('./log');
var utils = require('./utils');

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
  var nm;

  if(typeof options.timeout === 'number'){
    utils.reqTimeout = options.timeout;
    utils.resTimeout = options.timeout;
  }

  if(typeof options.debug === 'boolean'){
    log.isDebug = options.debug;
  }

  nm = require('./middlewares'); //nproxy middles

  port = typeof port === 'number' ? port : DEFAULT_PORT;

  app = connect();
  if(typeof options.responderListFilePath !== 'undefined'){
    app.use(nm.respond(options.responderListFilePath));
  }
  app.use(nm.forward());

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

  log.info('NProxy started on ' + port + '!');

  if (options.networks) {
    log.info('Network interfaces:');
    var interfaces = require('os').networkInterfaces();
    for (var key in interfaces) {
      log.info(key);
      interfaces[key].forEach(function (item) {
        log.info('  ' + item.address + '\t' + item.family);
      });
    }
  }

  return {
    httpServer: httpServer,
    httpsServer: httpsServer
  };
}


/**
 * Listen the CONNECTION method and forward the https request to internal https server
 */
function proxyHttps(){
  httpServer.on('connect', function(req, socket, upgradeHead){
    var netClient = net.createConnection(INTERNAL_HTTPS_PORT);

    netClient.on('connect', function(){
      log.info('connect to https server successfully!');
      socket.write( "HTTP/1.1 200 Connection established\r\nProxy-agent: Netscape-Proxy/1.1\r\n\r\n");
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
    netClient.on('error', function(err){
      log.error('netClient error ' + err.message);
      socket.end();
    });

  });
};

process.on('uncaughtException', function(err){
  log.error('uncaughtException: ' + err.message);
});

module.exports = nproxy;
