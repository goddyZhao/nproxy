var TYPE = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

var log = {
  print: function(type, msg){
    var logType = TYPE;
    var msgTpl;

    switch(type){
      case logType.ERROR:
        msgTpl = '\033[31m[ERROR] {{msg}} \033[0m';
        break;

      case logType.WARN:
        msgTpl = '\033[1;33m[WARN] {{msg}} \033[0m';
        break;

      case logType.INFO:
        msgTpl = '\033[36m[INFO] {{msg}} \033[0m';
        break;

      case logType.DEBUG:
        msgTpl = '\033[1;32m[DEBUG] {{msg}} \033[0m';
        break;
    }

    msgTpl = msgTpl.replace(/{{msg}}/, msg);

    console.log(msgTpl);
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