var url = require('url');
var http = require('http');

var util = {
  request: function(options, callback){
    var parserdUrl = url.parse(options.url);
    http.request({
      host: parserdUrl.hostname,
      port: parserdUrl.port || 80,
      path: parserdUrl.path,
      method: options.method || 'GET'
    }, function(err, res){
      if(err){ callback(err); return; }
      callback(null, res);
    }).end();
  }
}

module.exports = util;