var path = require('path');
var fs =require('fs');
var mime =require('mime');

function respondFromLocalFile(filePath, req, res, next){
  if(filePath.indexOf(path.sep) !== 0){
    throw new Error('Not a valid file path');
  }

  fs.stat(filePath, function(err, stat){
    if(err){ throw err; }
    if(!stat.isFile()){
      throw new Error('The responder is not a file!');
    }

    res.statusCode = 200;
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', mime.lookup(filePath));
    res.setHeader('Server', 'nproxy');

    fs.createReadStream(filePath).pipe(res);
  });
};

module.exports = respondFromLocalFile;