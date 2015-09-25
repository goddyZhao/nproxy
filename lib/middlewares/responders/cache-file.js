var utils = require('../../utils');
var url = require('url');
var log = require('../../log');
var mime =require('mime');
var respondFromWebFile =require('./web-file');
var fs =require('fs');
var mkdirp = require('mkdirp');

function respondAndCacheFromWebFile(fileURL, filePath, req, res, next) {
	log.debug('cache url: ' + fileURL + ' - file: '+filePath);

	// force encoding header so that it is not gzipped
	req.headers['Accept-Encoding'] = 'deflate, sdch';

	respondFromWebFile(fileURL, req, res, next, function(data) {

		// ensure folder folder
		var fileFolder = filePath.replace(/\/[^\/]*$/, '');
		mkdirp(fileFolder, function (err) {
			if (err) {
				console.error(err);
			}
		});

		try {
			fs.createWriteStream(filePath).write(data);
		} catch(err) {
			// throw err;
			log.error(err.message + ' for (' + filePath + ') from (' + fileURL +')');
		}

	});

}

module.exports = respondAndCacheFromWebFile;

