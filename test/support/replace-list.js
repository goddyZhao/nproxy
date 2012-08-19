var path = require('path');

var replacedDir = path.join(__dirname, 'files', 'replaced');

module.exports = [
  {
    pattern: 'web/a.css',
    responder: path.join(replacedDir, 'ar.css')
  },

  {
    pattern: 'web/b.*.css',
    responder: path.join(replacedDir, 'bstar.css')
  },

  {
    pattern: 'web/combined.js',
    responder: [
      path.join(replacedDir, 'c1.js'),
      path.join(replacedDir, 'c2.js')
    ]
  },

  {
    pattern: 'web/combined2.js',
    responder: {
      dir: replacedDir,
      src: [
        'c3.js',
        'c4.js'
      ]
    }
  },

  {
    pattern: 'web/',
    responder: replacedDir
  },
  {
    pattern: 'web/hot-deploy.js',
    responder: path.join(replacedDir, 'hot-deploy.js')
  }
];