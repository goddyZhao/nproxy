var constants = require('constants')
var os = require('os');
var http = require('http');
var https = require('https');
var path = require('path');
var fs =require('fs');
var Buffer = require('buffer').Buffer;
var url = require('url');
var Step = require('step');
var log = require('./log');

http.globalAgent.maxSockets = 25;
https.globalAgent.maxSockets = 25;

var utils = {
  /**
   * Process url with valid format especially in https cases
   * in which, req.url doesn't include protocol and host
   *
   * @param {Object} req
   */
  processUrl: function(req){
    var hostArr = req.headers.host.split(':');
    var hostname = hostArr[0];
    var port = hostArr[1];

    var parsedUrl = url.parse(req.url, true);

    parsedUrl.protocol = parsedUrl.protocol || req.type + ":";
    parsedUrl.hostname = parsedUrl.hostname || hostname;

    if(!parsedUrl.port && port){
      parsedUrl.port = port;
    }

    return url.format(parsedUrl);
  },

  processUrlWithQSAbandoned: function(urlStr){
    return urlStr.replace(/\?.*$/, '');
  },

  /**
   * Simple wrapper for the default http.request
   *
   * @param {Object} options options about url, method and headers
   * @param {Function} callback callback to handle the response object
   */
  request: function(options, callback){
    var parsedUrl;
    var requestUrl;
    var requestMethod;
    var requestHeaders;
    var requestHandler;
    var requestOptions;
    var request;
    var sender;
    var requestTimeout;
    var responseTimeout;
    var buffers;

    if(typeof callback !== 'function'){
      log.error('No callback specified!');
      return;
    }

    requestHandler = callback;

    if(typeof options !== 'object'){
      requestHandler(new Error('No options specified!'));
      return;
    }

    requestUrl = options.url;

    if(typeof requestUrl === 'undefined'){
      requestHandler(new Error('No url specified!'));
      return;
    }

    try{
      requestUrl = url.parse(requestUrl);
    }catch(e){
      requestHandler(new Error('Invalid url'));
      return;
    }

    requestMethod = options.method || 'GET';
    requestHeaders = options.headers;

    requestOptions = {
      hostname: requestUrl.hostname || 'localhost',
      port: requestUrl.port || (requestUrl.protocol === 'https:' ? 443 : 80),
      method: requestMethod,
      path: requestUrl.path,
      rejectUnauthorized: false,
      secureOptions: constants.SSL_OP_NO_TLSv1_2 // degrade the SSL version as v0.8.x used
    };

    if(typeof requestHeaders === 'object'){
      requestOptions.headers = requestHeaders;
    }

    sender = requestUrl.protocol === 'https:' ? https : http;

    requestTimeout = setTimeout(function(){
      log.error('Request timeout for ' + options.url);
      requestTimeout = null;
      request.abort();
      requestHandler(new Error('Request Timtout'));
    }, utils.reqTimeout);

    log.debug('Send ' + requestMethod + ' for ' + options.url + ' at ' + new Date());
    request = sender.request(requestOptions, function(res){
      log.debug('Finish ' + requestMethod + ' the request for ' + options.url + ' at ' + new Date());

      clearTimeout(requestTimeout);
      responseTimeout = setTimeout(function(){
        log.error('Response timeout for ' + requestMethod + ' ' + options.url);
        responseTimeout = null;
        request.abort();
        requestHandler(new Error('Response timeout'));
      }, utils.resTimeout);

      buffers = [];
      res.on('data', function(chunk){
        buffers.push(chunk);
      });

      res.on('end', function(){
        log.debug('Get the response of ' + requestMethod + ' ' + options.url + ' at ' + new Date());
        if(responseTimeout){
          clearTimeout(responseTimeout);
        }
        requestHandler(null, Buffer.concat(buffers), res);
      });
    });

    if(utils.isContainBodyData(requestMethod)){
      request.write(options.data);
    }

    request.on('error', function(err){
      log.error('url: ' + options.url);
      log.error('msg: ' + err.message);

      if(requestTimeout){
        clearTimeout(requestTimeout);
      }

      requestHandler(err);
    });

    request.end();
  },

  /**
   * Concat files in the file list into one single file
   * 
   * @param {Array} fileList 
   * @param {String} dest the path of dest file 
   * 
   */
  concat: function(fileList, cb){
    var group;
    var buffers = []
    if(!Array.isArray(fileList)){
      log.error('fileList is not a Array!');
      return;
    }

    log.info('Start combine ' + fileList.length + ' files');

    Step(
      function readFiles(){
        group = this.group();

        fileList.forEach(function(file){
          fs.readFile(file, group());
        });
      },

      /**
       * Receive all the file contents
       * 
       * @param {Object} err
       * @param {Array} files Buffer list
       */
      function concatAll(err, files){
        if(err){ cb(err); }
        log.info('Finish combination!');
        cb(null, Buffer.concat(utils._appendEnter(files)));
      }
    );
  },

  /**
   * This is a hack function to avoid the grammer issue when concating files
   * 
   * @param {Array} files buffer array containing the file contents
   * 
   * @return {Array} buffer array containing the file contents and appended enter character
   */
  _appendEnter: function(files){
    var newBuffers = [];
    files.forEach(function(buffer){
      newBuffers.push(buffer);
      newBuffers.push(new Buffer('\n'));
    });

    return newBuffers;
  },

  /**
   * Find file according to the file pattern in the specified directory
   *
   * @param {String} directory
   * @param {String} filePattern
   * @param {Function} callback
   * 
   * @return {String} matched file path
   */
  findFile: function(directory, filename, callback){
    Step(
      function readDirectory(){
        fs.readdir(directory, this);
      },

      function stat(err, files){
        var group;
        var file;
        var matchedStore = [];
        var stat;
        var index;

        if(err){
          callback(err);
          return;
        }

        for(var i = 0, l = files.length; i < l ; i++){
          file = files[i];
          
          try{
            stat = fs.statSync(path.join(directory, file));
          }catch(e){
            log.error(e.message);
            continue;
          }

          if(stat.isFile()){
            index = path.basename(filename, path.extname(filename))
                      .indexOf(path.basename(file, path.extname(file)));

            if(index !== -1 && path.extname(filename) === path.extname(file)){
              matchedStore.push(file);
            }
          }
        }

        return matchedStore;

      },

      function match(err, matchedResults){
        var matchedFile;

        matchedResults.forEach(function(item){
          if(typeof matchedFile === 'undefined'){
            matchedFile = item;
          }else{
            matchedFile = item.length > matchedFile.length 
                            ? item
                            : matchedFile;
          }
        });

        if(typeof matchedFile === 'undefined'){
          callback(new Error('No file matched with ' + filename));
        }else{
          callback(null, path.join(directory, matchedFile));
        }
      }
    );
  },

  /**
   * Is the path a absolute path
   * 
   * @param {String} filePath
   * @return {Boolean}
   */
  isAbsolutePath: function(filePath){
    if(typeof filePath !== 'string'){
      return false;
    }

    if(os.platform && os.platform() === 'win32'){
      return filePath.indexOf(':') !== -1;
    }else{
      return filePath.indexOf(path.sep) === 0;
    }
  },

  /**
   * Does the HTTP request contain body data
   *
   * @param {String} HTTP method token
   *
   * @return {Boolean}
   */
  isContainBodyData: function(method){
    if (!method){
      return false;
    }

    var white_list = ['POST', 'PUT'];
    return white_list.some(function(i){
      return i === method;
    });
  }
};

var reqTimeout = REQ_TIMEOUT = 10 * 1000;
Object.defineProperty(utils, 'reqTimeout', {
  set: function(v){
    reqTimeout = v * 1000;
  },
  get: function(){
    return reqTimeout;
  }
});

var resTimeout = RES_TIMEOUT = 10 * 1000;
Object.defineProperty(utils, 'resTimeout', {
  set: function(v){
    resTimeout = v * 1000;
  },
  get: function(){
    return resTimeout;
  }
});

module.exports = utils;