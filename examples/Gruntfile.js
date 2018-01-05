// Example of nproxy configuration for grunt
// http://gruntjs.com/

module.exports = function (grunt) {
  'use strict';
  var nproxy = require('nproxy'),
    argv   = require('yargs').argv;


  grunt.registerTask('nproxy', 'start nproxy to proxy local JS and CSS files', function() {

    // Grunt should not finish the task
    this.async();

    // This will serve static local files for JS & CSS intead of remote ones
    // use: `localhost:8989` as proxy parameter

    // see `nproxy-conf.js` for proxy configuration
    var port = 8989,
      options = {
        timeout : 100,
        debug   : !!argv.debug
      };

    // OPTIONAL: If you want nproxy requests to be proxyfied
    try {
      var proxyConf = require('./.proxy-auth.json');
      options.proxy = proxyConf;
    } catch(e) { }

    options.responderListFilePath = require('./nproxy-conf.js')(argv);

    nproxy(port, options);
  });

};


