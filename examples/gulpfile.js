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
        timeout: 100,
        debug: false
      };

  options.responderListFilePath = require('./nproxy-conf.js')(argv);

  return nproxy(port, options);

});
