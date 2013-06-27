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
 * 1. Single file (from local or internet)
 * 2. Combo file
 * 3. Directory Mapping
 * 4. custom function(for other combo cases)(TODO)
 *
 * @param {String} responderListFilePath 
 */
function respond(responderListFilePath){
  var responderList = _loadResponderList(responderListFilePath);

  //watch the rule file
  _watchRuleFile(responderListFilePath, function(){
    responderList = _loadResponderList(responderListFilePath);
  });

  return function respond(req, res, next){
    var url = utils.processUrl(req);
    var pattern; // url pattern
    var originalPattern;
    var responder;
    var matched = false;
    var respondObj;
    var stat;

    /**
     * For directory mapping
     */
    var extDirectoryOfRequestUrl;
    var localDirectory;


    var imgFileBasePath;

    log.debug('respond: ' + url);

    for(var i = 0, len = responderList.length; i < len; i++){
      respondObj = responderList[i];
      originalPattern = respondObj.pattern;
      responder = respondObj.responder;

      // adapter pattern to RegExp object
      if(typeof originalPattern !== 'string' && !(originalPattern instanceof RegExp)){
        log.error()
        throw new Error('pattern must be a RegExp Object or a string for RegExp');
      }

      pattern = typeof originalPattern === 'string' ? new RegExp(originalPattern) : originalPattern;

      if(pattern.test(url)){
        log.info('matched url: ' + url);

        matched = true;

        log.debug('before fix responder: ' + responder);

        responder = fixResponder(url, pattern, responder);

        log.debug('after fix responder: ' + responder);

        if(typeof responder === 'string'){

          if(httpRxg.test(responder)){
            responders.respondFromWebFile(responder, req, res, next);
          }else{
            fs.stat(responder, function(err, stat){
              if(err){
                log.error(err.message + 'for (' + url + ')' +
                    ' then directly forward it!');
                next();
              }else{
                if(stat.isFile()){ // local file
                  responders.respondFromLocalFile(responder, req, res, next);
                }else if(stat.isDirectory()){ // directory mapping
                  var urlWithoutQS = utils.processUrlWithQSAbandoned(url);
                  var directoryPattern = url.match(pattern)[0];
                  extDirectoryOfRequestUrl = urlWithoutQS.substr(
                      urlWithoutQS.indexOf(directoryPattern) + directoryPattern.length);
                  localDirectory = path.join(responder, 
                      path.dirname(extDirectoryOfRequestUrl));

                  utils.findFile(localDirectory, 
                      path.basename(extDirectoryOfRequestUrl),
                      function(err, file){
                        log.debug('Find local file: ' + file + ' for (' + url + ')');
                        if(err){
                          log.error(err.message + ' for (' + url + ')' + 
                              ' then directly forward it!');
                          next();
                        }else{
                          responders.respondFromLocalFile(file, req, res, next);
                        }
                  });
                }
              }
            });
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
 * For some responder with regular expression variable like $1, $2, 
 * it should be replaced with the actual value
 * 
 * @param {Regular Express Object} pattern matched array
 * @param {String} responder, replaced string
 */
function fixResponder(url, pattern, responder){
  var $v = /\$\d+/g;
  var m;
  var newRx;
  if(!$v.test(responder)){
    return responder;
  }

  m = url.match(pattern);

  if(!Array.isArray(m)){
    return responder;
  }

  for(var i = 0, l = m.length; i < l; i++){
    newRx = new RegExp('\\$' + i, 'g');
    responder = responder.replace(newRx, m[i]);
  }

  return responder;
}


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

  if(!utils.isAbsolutePath(responderListFilePath)){
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