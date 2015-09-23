/**
 * Dynamically generate the ssl key and crt according to the hostname
 */
var exec = require('child_process').exec;
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var utils = require('./utils');
var log = require('./log');

var certDir = utils.getCertDir();
var generateServerCertsCmd = path.join(__dirname, '..', 'generate-certs-cmd', 'generate-server-cert.sh');

function getCerts (hostname, cb) {
  var serverKeyFilePath = path.join(certDir, hostname + '.key');
  var serverCrtFilePath = path.join(certDir, hostname + '.crt');

  if (!fs.existsSync(serverKeyFilePath) || !fs.existsSync(serverCrtFilePath)) {
    log.debug('Server certs do not exist');
    log.debug('Generate certs');
    generateCerts(hostname, function (err) {
      if (err) {
        return cb(err);
      }

      log.debug('Generated certs');
      cb(null, {
        serverKey: fs.readFileSync(serverKeyFilePath),
        serverCrt: fs.readFileSync(serverCrtFilePath)
      })
    });
  } else {
    cb(null, {
      serverKey: fs.readFileSync(serverKeyFilePath),
      serverCrt: fs.readFileSync(serverCrtFilePath)
    })
  }
}

function generateCerts (hostname, cb) {
  log.debug('Check root CA');
  _checkRootCA();

  log.debug('Run generate command');
  var cmdToRun = generateServerCertsCmd + ' ' + hostname + ' ' + certDir + '/';
  log.debug(cmdToRun)
  exec(cmdToRun, {
    cwd: certDir
  }, function (err, stdout, stderr) {
    if (err) {
      return cb(err);
    }

    log.debug('Generated server certs for ' + hostname);
    cb(null);
  });
}

/**
 * Check the ca files
 *
 * Copy them if they does not exist
 */
function _checkRootCA () {
  var caKeyFilePath = path.join(certDir, 'ca.key');
  var caCrtFilePath = path.join(certDir, 'ca.crt');

  var keysDir = path.join(__dirname, '..', 'keys');

  if (!fs.existsSync(caKeyFilePath) || !fs.existsSync(caCrtFilePath)) {
    log.debug('CA files do not exist');
    log.debug('Copy CA files');
    fse.copySync(path.join(keysDir, 'ca.key'), caKeyFilePath);
    fse.copySync(path.join(keysDir, 'ca.crt'), caCrtFilePath);
  }
}

exports.getCerts = getCerts;