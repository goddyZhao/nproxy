var utils = require('../utils');
var log = require('../log');
var Buffer = require('buffer').Buffer;

/**
 * Forward the request directly
 */
function forward(){
  return function forward(req, res, next){
    var options = {
      url: req.url,
      method: req.method,
      headers: req.headers
    }
    var buffers = [];
    if(req.method === 'POST'){
      req.on('data', function(chunk){
        buffers.push(chunk);
      });

      req.on('end', function(){
        options.data = Buffer.concat(buffers);
        utils.request(options, function(err, proxyRes){
          if(err){ throw err; }
          _forwardHandler(proxyRes, res);
        });
      });
    }else{
      utils.request(options, function(err, proxyRes){
        if(err){ throw err; }
        _forwardHandler(proxyRes, res)
      }); 
    }
  };
};

function _forwardHandler(proxyRes, res){
  res.writeHead(proxyRes.statusCode, proxyRes.headers);

  proxyRes.on('data', function(chunk){
    res.write(chunk);
  });

  proxyRes.on('end', function(){
    res.end();
  });
}

module.exports = forward;