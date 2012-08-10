# nproxy

A cli proxy tool specialized in file replacing

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

## Template of Replace Rule file(should be a .js file)

    module.exports = [

      // 1. replace single file
      {
        pattern: /homepage\.js/,      // Match url you wanna replace
        responder:  "file path"
      },

      // 2. replace combo file with src with absolute file path
      {
        pattern: /group\/homepageTileFramework.*\.js/,
        responder: [
          '/home/goddyzhao/workspace/webapp/ui/homepage/js/a.js',
          '/home/goddyzhao/workspace/webapp/ui/homepage/js/b.js',
          '/home/goddyzhao/workspace/webapp/ui/homepage/js/c.js'
        ] 
      },

      // 3. replace combo file with src with relative file path and specified dir
      {
        pattern: /group\/homepageTileFramework.*\.js/,
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

You can use the [template file](blob/master/replace-rule.sample.js) and replace it with your own configurations. 

## Quickly setup rule files for SF project

For UI Developers from SuccessFactors, here is a bonus for you guys. You can use the [sf-transfer](http://github.com/goddyZhao/sf-transfer) tool to transfer the combo xml file to nproxy rule file automatically!

## License

nproxy is available under the terms of the MIT License