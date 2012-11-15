var nproxy = require('./');

var options = {
  timeout: 10,
  debug: true
}

var port = 8989;
nproxy(port, options );