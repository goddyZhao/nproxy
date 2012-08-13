var utils = require('../../utils');

function respondFromWebFile(filePath, req, res, next){
   utils.request({
      url: filePath,
      method: req.method,
      headers: req.headers
    }, function(err, data, proxyRes){
      if(err){ throw err; }
      res.writeHead(200, proxyRes.headers);
      res.write(data);
      res.end();

    });
};

module.exports = respondFromWebFile;