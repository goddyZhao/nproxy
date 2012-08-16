# nproxy

A cli proxy tool specialized in file replacing

## Features

* Support Mac, Linux and Windows  
* Support both single file and combo file replacing
* Support directory mapping with any files

## Installation

    npm install -g nproxy (node >= v0.8.x is required)

## Usage
    
    nproxy -l replace_rule.js 

    Setting your browser's proxy to 127.0.0.1:port(8989 by default)



### More Options:

    Usage: nproxy [options]

    Options:

      -h, --help         output usage information
      -V, --version      output the version number
      -l, --list [list]  Specify the replace rule file
      -p, --port [port]  Specify the port nproxy will listen on(8989 by default)

### Fiddler Users Should Know
  
  Besides writing your replace-rule file and start a nproxy server, there's still
  _One More Thing_ to do: that is setting up your browser's proxy.

  Say, you have a replace-rule file named _replace.js_ with the following rule:
  
    module.exports = [
      {
        pattern:   "http://yoursite/app.min.js",
        responder: "http://devserver/app.js"
      }
    ]

  After you start up nproxy server with `nproxy -l replace.js`, (Suppose you're
  using Safari) click __Preferences__, select __Advanced__ tab, click __Change Settings...__;
  then check __Web Proxy(HTTP)__, fill in __Web Proxy Server__ fields with 127.0.0.1 and 8989.

  Now, when you try access _http://yoursite/app.min.js_ in Safari, you actually get _http://devserver/app.js_.

## Template of Replace Rule file(should be a .js file)

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

You can use the [template file](https://github.com/goddyzhao/nproxy/blob/master/replace-rule.sample.js) and replace it with your own configurations. 

## Quickly setup rule files for SF project

For UI Developers from SuccessFactors, here is a bonus for you guys. You can use the [sf-transfer](http://goddyzhao.github.com/sf-transfer) tool to transfer the combo xml file to nproxy rule file automatically!

## License

nproxy is available under the terms of the MIT License