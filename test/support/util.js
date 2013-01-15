var url = require('url');
var http = require('http');
var https = require('https');
var Buffer = require('buffer').Buffer;

var util = {
  request: function(options, callback){
    var parserdUrl = url.parse(options.url);
    var requestOptions = {
      host: parserdUrl.hostname,
      port: parserdUrl.port || (parserdUrl.protocol === 'http:' ? 80 : 443),
      path: parserdUrl.path.substr(1),
      method: options.method || 'GET'
    };
    var request;
    var sender;

    if(options.headers){
      requestOptions.headers = options.headers;
    }

    sender = parserdUrl.protocol === 'http:' ? http : https;
    request = sender.request(requestOptions, function(err, res){
      if(err){ callback(err); return; }
      callback(null, res);
    });

    if(options.data){
      request.write(new Buffer(options.data, 'utf-8'));
    }

    request.end();
  }
}

module.exports = util;