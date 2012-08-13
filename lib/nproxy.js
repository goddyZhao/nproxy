var connect = require('connect');
var nm = require('./middlewares'); //nproxy middles
var log = require('./log');

var DEFAULT_PORT = 8989;
var server;

/**
 * Start up nproxy server on the specified port
 * and combine the processors defined as connect middlewares into it.
 * 
 * @param {String} port the port proxy server will listen on
 * @param {Object} options options for the middlewares
 */
function nproxy(port, options){

  port = typeof port === 'number' ? port : DEFAULT_PORT;

  server = connect();
  // server.use(connect.bodyParser());
  if(typeof options.responderListFilePath !== 'undefined'){
    server.use(nm.respond(options.responderListFilePath));
  }
  server.use(nm.forward());

  log.info('nproxy started on ' + port + '!');
  
  return server.listen(port);
}

process.on('uncaughtException', function(err){
  log.error('uncaughtException: ' + err.message);
});

module.exports = nproxy;