var fs = require('fs');
var path = require('path');
var mime =require('mime');
var responders = require('./responders');
var utils = require('../utils');
var log = require('../log');

/**
 * Respond to the request with the specified responder if the url
 * matches the defined url pattern from the responder list file.
 * The following three kinds of responders are supported.
 * 1. file from internet
 * 2. local file
 * 3. default rule as sf, combo
 * 3. custom function(for other combo cases)
 *
 * @param {String} responderListFilePath 
 */
function respond(responderListFilePath){

  var responderList = _loadResponderList(responderListFilePath);

  return function respond(req, res, next){
    var url = req.url;
    var pattern; // url pattern
    var originalPattern;
    var responder;
    var matched = false;
    var httpRxg = /^http/;
    var imgRxg = /(\.(img|png|gif|jpg|jpeg))$/i
    var respondObj;
    var stat;

    var imgFileBasePath;

    for(var i = 0, len = responderList.length; i < len; i++){
      respondObj = responderList[i];
      originalPattern = respondObj.pattern;
      responder = respondObj.responder;

      // apapter pattern to RegExp object
      if(typeof originalPattern !== 'string' && !(originalPattern instanceof RegExp)){
        log.error()
        throw new Error('pattern must be a RegExp Object or a string for RegExp');
      }

      pattern = typeof originalPattern === 'string' ? new RegExp(originalPattern) : originalPattern;

      if(pattern.test(url)){
        log.info('matched url: ' + url);

        matched = true;

        if(typeof responder === 'string'){
          if(httpRxg.test(responder)){
            responders.respondFromWebFile(responder, req, res, next);
          }else{
            try{
              stat = fs.statSync(responder);
            }catch(e){
              log.error(responder + 'doesn\'t exist!');
              next();
              break;
            }

            if(typeof stat === 'undefined'){
              log.error(responder + 'doesn\'t exist!');
              next();
              break;
            }

            if(stat.isDirectory()){
              if(!imgRxg.test(url)){
                next();
                break;
              }else{
                imgFileBasePath = url.substr(url.indexOf(originalPattern) 
                  + originalPattern.length);
                responder = path.join(responder,imgFileBasePath);
                responders.respondFromLocalFile(responder, req, res, next);
              }
            }else{
              responders.respondFromLocalFile(responder, req, res, next);
            }
          }
        }else if(Array.isArray(responder)){
          responders.respondFromCombo({
            dir: null,
            src: responder
          }, req, res, next);
        }else if(typeof responder === 'object' && responder !== null){
          responders.respondFromCombo({
            dir: responder.dir,
            src: responder.src
          }, req, res, next);
        }else{
          log.error('Responder for ' + url + 'is invalid!');
          next();
        }

        break;
      }
    }

    if(!matched){

      // log.info('forward: ' + url);
      next();
    }
  }
};

/**
 * Load the list file and return the list object
 *
 * @param {String} responderListFilePath
 * @return {Array} responder list
 * 
 * @api private
 */
function _loadResponderList(responderListFilePath){
  var filePath = responderListFilePath;

  if(typeof filePath !== 'string'){
    return null;
  }

  if(!fs.existsSync(responderListFilePath)){
    throw new Error('File doesn\'t exist!');
  }

  if(filePath.indexOf(path.sep) !== 0){
    filePath = path.join(process.cwd(), filePath);
  }

  return _loadFile(filePath);
}

/**
 * Load file 
 *
 * @return {Array} load list from a file
 */
function _loadFile(filename){
  return require(filename);
}

module.exports = respond;