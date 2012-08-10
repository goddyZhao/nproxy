module.exports = [

  // 1. replace single file
  {
    pattern: 'homepage.js',      // Match url you wanna replace
    responder:  "file path"
  },

  // 2. replace combo file with src with absolute file path
  {
    pattern: 'group/homepageTileFramework.*.js', 
    responder: [
      '/home/goddyzhao/workspace/webapp/ui/homepage/js/a.js',
      '/home/goddyzhao/workspace/webapp/ui/homepage/js/b.js',
      '/home/goddyzhao/workspace/webapp/ui/homepage/js/c.js'
    ] 
  },

  // 3. replace combo file with src with relative file path and specified dir
  {
    pattern: 'group/homepageTileFramework.*.js',
    responder: {
      dir: '/home/goddyzhao/workspace/webapp/ui/homepage/js',
      src: [
        'a.js',
        'b.js',
        'c.js'
      ]
    }
  }
];