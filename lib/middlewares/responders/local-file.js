var fs =require('fs');
var mime =require('mime');
var utils = require('../../utils');
var jsonfile = require('jsonfile');
var log = require('../../log');

function respondFromLocalFile(filePath, req, res, next){
  if(!utils.isAbsolutePath(filePath)){
    throw new Error('Not a valid file path');
  }

  fs.stat(filePath, function(err, stat){
    if(err){ throw err; }
    if(!stat.isFile()){
      throw new Error('The responder is not a file!');
    }

    try {
      var headers = jsonfile.readFileSync(filePath+'.headers');
      headers['server'] = 'nproxy';
      res.writeHead(200, headers);
    } catch(err) {
      // log.error(err);
      res.statusCode = 200;
      res.setHeader('Server', 'nproxy');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', mime.lookup(filePath));
    }

    fs.createReadStream(filePath).pipe(res);
  });
};

module.exports = respondFromLocalFile;