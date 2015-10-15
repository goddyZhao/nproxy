var TYPE = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

var log = {
  print: function(type, msg){

    var fancyLog = require('fancy-log');
    var colors = require('colors');
    
    var logType = TYPE;
    var msgTpl;

    switch(type){
      case logType.ERROR:
        msgTpl = '{{msg}}'.red;
        break;

      case logType.WARN:
        msgTpl = '{{msg}}'.yellow;
        break;

      case logType.INFO:
        msgTpl = '{{msg}}'.white;
        break;

      case logType.DEBUG:
        msgTpl = '{{msg}}'.cyan;
        break;
    }

    msgTpl = msgTpl.replace(/{{msg}}/, msg);

    fancyLog(msgTpl);
  },

  info: function(msg){
    log.print(TYPE.INFO, msg);
  },

  warn: function(msg){
    log.print(TYPE.WARN, msg);
  },

  error: function(msg){
    log.print(TYPE.ERROR, msg);
  },

  debug: function(msg){
    if(log.isDebug){
      log.print(TYPE.DEBUG, msg);
    }
  }
};

var isDebug = false;
Object.defineProperty(log, 'isDebug',{
  set: function(v){
    isDebug = v;
  },
  get: function(){
    return isDebug;
  }
});

module.exports = log;
