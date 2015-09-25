'use strict';
/* jshint node:true */

// This is the configuration file to bind HTTP requests
// to local files, when using `nproxy` with gulp or grunt

// available CLI arguments:
// `--css` serve only CSS files
// `--js`  serve only JS files
// `--no-external` serve external files (some-analytics-provider, some-other-service-provider) as empty

module.exports = function(options) {
  var mapping = [],

    base       = __dirname  + '/assets',
    css_folder = base + 'css/',
    js_folder  = base + 'js/',

    // `concat.js` will be served as the concatenation of the following files
    concat = [
      js_folder + 'sample-file-1.js',
      js_folder + 'sample-file-2.js',
      js_folder + 'sample-file-3.js',
      // this file is not included in prod, but it contains dev tools
      // (it can be a screen logger for mobile and tablets, etc.)
      js_folder + 'dev-debbuging-tools.js'
    ];


  // serve local JS files
  // do not include JS if `--css` specified
  if(!options.css) {
    console.log('SERVING LOCAL JS FILES');

    // serve `concat.js`
    mapping.push({
      pattern   : /my-website.*concat\.js/,
      responder : concat
    });

    // other JS files
    // http://my-website.com/assets/js/subdir/myfile.js
    // $1 = subdir/myfile.js
    mapping.push({
      pattern   : /my-website.*\/js\/(.*\.js)/,
      responder : js_folder + '$1'
    });

  }


  // serve local CSS files
  // do not include CSS if `--js` specified
  if(!options.js) {
    console.log('SERVING LOCAL CSS Files');

    // CSS files
    // http://my-website.com/assets/css/subdir/myfile.css
    // $1 = news/article/article.css
    mapping.push({
      pattern   : /my-website.*\/css\/(.*\.css)/,
      responder : css_folder + '$1'
    });
  }

  // This will remove external scripts (served as empty files)
  // specify `--no-external` to activate this feature
  if(options.external === false) {
    console.log('NO EXTERNAL (scripts are served empty)');
    mapping.push({
      pattern   : /(some-analytics-provider|some-other-service-provider).*\.js/,
      responder : js_folder + 'empty.js'
    });
  }

  // Experimental : cache
  // specify `cache: true` to save web content into a local file
  // you might want to use a cache folder and add it to `.gitignore`
  mapping.push({
    pattern   : /(someURL\.html)/,
    responder : __dirname + '/cache/$1',
    cache     : true
  });

  // any other request that doesn't match the rules above will be forwarded

  return mapping;

};





