var utils = require('../../utils');
var url = require('url');
var log = require('../../log');

function respondFromWebFile(filePath, req, res, next) {
	log.debug('respond with web file: ' + filePath);

	// Fix the host of request header to the web file's host
	var remoteHost = url.parse(filePath).host;
	req.headers && (req.headers.host = remoteHost);

	var options = {
		url: filePath,
		method: req.method,
		headers: req.headers
	};

	var respondFromWebSuccess = function(err, data, proxyRes) {
		if (err) {
			throw err;
		}
		res.writeHead(proxyRes.statusCode, proxyRes.headers);
		res.write(data);
		res.end();
	};

	if (req.method == 'POST') {
		var body = '';
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			options['data'] = body;
			utils.request(options, respondFromWebSuccess);
		});
	} else {
		utils.request(options, respondFromWebSuccess);
	}
}

module.exports = respondFromWebFile;

