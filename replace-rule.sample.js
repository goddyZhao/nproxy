module.exports = [

  // 1. replace single file with local one
  {
    pattern: 'homepage.js',      // Match url you wanna replace
    responder:  "/home/goddyzhao/workspace/homepage.js"
  },

  // 2. replace single file with web file
  {
    pattern: 'homepage.js',      // Match url you wanna replace
    responder:  "http://www.anotherwebsite.com/assets/js/homepage2.js"
  },

  // 3. replace combo file with src with absolute file path
  {
    pattern: 'group/homepageTileFramework.*.js', 
    responder: [
      '/home/goddyzhao/workspace/webapp/ui/homepage/js/a.js',
      '/home/goddyzhao/workspace/webapp/ui/homepage/js/b.js',
      '/home/goddyzhao/workspace/webapp/ui/homepage/js/c.js'
    ] 
  },

  // 4. replace combo file with src with relative file path and specified dir
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
  },

  // 5. Map server image directory to local image directory
  {
    pattern: 'ui/homepage/img',  // must be a string
    responder: '/home/goddyzhao/image/' //must be a absolute directory path
  }
];