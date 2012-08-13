var path = require('path');

module.exports = [
  {
    pattern: 'a.css',
    responder: path.join(__dirname, 'files', 'ar.css')
  }
];