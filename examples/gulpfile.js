// Example of nproxy configuration for gulp
// http://gulpjs.com/

'use strict';

var gulp   = require('gulp'),
    nproxy = require('nproxy'),
    argv   = require('yargs').argv;

// This will serve static local files intead of remote ones
// use: `localhost:8989` as proxy parameter

// see `nproxy-conf.js` for proxy configuration

gulp.task('nproxy', function nproxyTask(host) {

  var port = 8989,
      options = {
				timeout : 100,
				debug   : !!argv.debug
      };

  // OPTIONAL: If you want nproxy requests to be proxyfied
  options.proxy = {
    host   : 'proxyhost',                                // mandatory
    port   : 80,                                         // optional, default to 80
    auth   : 'login:pass',                               // optional
    bypass : ['localhost', 'dev.localhost', 'bypass.me'] // optional, default to ['127.0.0.1', 'localhost']
  };

  options.responderListFilePath = require('./nproxy-conf.js')(argv);

  return nproxy(port, options);

});
