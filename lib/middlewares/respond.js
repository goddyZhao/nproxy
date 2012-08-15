var fs = require('fs');
var path = require('path');
var mime =require('mime');
var responders = require('./responders');
var utils = require('../utils');
var log = require('../log');

var httpRxg = /^http/;
var imgRxg = /(\.(img|png|gif|jpg|jpeg))$/i

/**
 * Respond to the request with the specified responder if the url
 * matches the defined url pattern from the responder list file.
 * The following three kinds of responders are supported.
 * 1. file from internet
 * 2. local file
 * 3. default rule as sf, combo
 * 4. custom function(for other combo cases)(TODO)
 *
 * @param {String} responderListFilePath 
 */
function respond(responderListFilePath){
  var responderList = _loadResponderList(responderListFilePath);
  var patternCache = _cachePattern(responderList);

  //watch the rule file
  _watchRuleFile(responderListFilePath, function(){
    responderList = _loadResponderList(responderListFilePath);
    patternCache = _cachePattern;
  });

  return function respond(req, res, next){
    var url = req.url;
    var pattern; // url pattern
    var originalPattern;
    var responder;
    var matched = false;
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
                if(!_isMatchPatternInCache(patternCache, req.headers.referer)){
                  next();
                  return;
                }
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

function _isMatchPatternInCache(cache, url){
  var pattern;

  if(!Array.isArray(cache)){
    return false;
  }

  for(var i = 0, l = cache.length; i < l; i++){
    pattern = typeof cache[i] === 'string' ? new RegExp(cache[i]) : cache[i];
    if(pattern.test(url)){
      return true;
    }
  }

  return false;
};

/**
 * Cache all the pattern except patterns for img directory
 * Because proxy should only replace imgs referred by our replaced file 
 * and shouldn't replace others even they match the pattern
 * 
 * @example
 * a.js refers /ui/img/a.img
 * b.js refers /ui/img/b_dev-snapshot.img
 * we replace a.js 
 * and img pattern is: '/ui/img'
 * 
 * we should forward the request for b_dev-snapshot.img
 * 
 */
function _cachePattern(list){
  var cache = [];
  var pattern;
  var responder;
  var stat;

  if(!Array.isArray(list)){
    return cache;
  }

  list.forEach(function(item){
    pattern = item.pattern;
    responder = item.responder;

    if(typeof responder === 'string'){ // file or directory
      if(httpRxg.test(responder)){
        cache.push(pattern);
        return;
      }

      try{
        stat = fs.statSync(responder);
      }catch(e){
        return;
      }

      if(stat.isDirectory()){
        return;
      }

      cache.push(pattern);
      
    }else{
      cache.push(item.pattern);
    }
  });

  return cache;
};

/**
 * Watch the rule file to support applying changed rules without restart the proxy
 *
 * @param {String} file the path of the file
 * @param {Function} callback
 */
function _watchRuleFile(file, callback){
  fs.watchFile(file, function(curr, prev){
    log.warn('The rule file has been modified!');
    callback();
  });
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
 * Load file without cache
 *
 * @return {Array} load list from a file
 */
function _loadFile(filename){
  var module = require(filename);
  delete require.cache[require.resolve(filename)];
  return module;
}

module.exports = respond;