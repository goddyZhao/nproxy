var utils = require('../../utils');

function respondFromWebFile(filePath, req, res, next){
   utils.request({
      url: filePath,
      method: req.method,
      headers: req.headers
    }, function(err, proxyRes){
      res.writeHead(200, proxyRes.headers);

      proxyRes.on('data', function(chunk){
        res.write(chunk);
      });

      proxyRes.on('end', function(){
        res.end();
      });
    });
};

module.exports = respondFromWebFile;