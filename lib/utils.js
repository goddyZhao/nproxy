var os = require('os');
var http = require('http');
var fs =require('fs');
var Buffer = require('buffer').Buffer;
var url = require('url');
var Step = require('step');
var log = require('./log');

var utils = {

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
      host: requestUrl.hostname || 'localhost',
      port: requestUrl.port || 80,
      method: requestMethod,
      path: requestUrl.path
    };

    if(typeof requestHeaders === 'object'){
      requestOptions.headers = requestHeaders;
    }

    request = http.request(requestOptions, function(res){
      requestHandler(null, res);
    });

    if(requestMethod === 'POST'){
      request.write(options.data);
    }

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
  }
};

module.exports = utils;