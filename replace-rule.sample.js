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
  },

  // 6. Write responder with regular expression variables like $1, $2
  {
    pattern: /https?:\/\/[\w\.]*(?::\d+)?\/ui\/(.*)_dev\.(\w+)/,
    reponder: 'http://localhost/proxy/$1.$2'
  },

  // 7. Map server image directory to local image directory with regular expression
  // This simple rule can replace multiple directories to corresponding locale ones
  // For Example, 
  //   http://host:port/ui/a/img/... => /home/a/image/...
  //   http://host:port/ui/b/img/... => /home/b/image/...
  //   http://host:port/ui/c/img/... => /home/c/image/...
  //   ...
  {
    pattern: /ui\/(.*)\/img\//,
    responder: '/home/$1/image/'
  }
];