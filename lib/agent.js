'use strict';
var url = require('url');
var tunnel = require('tunnel-agent')
var log = require('./log');
var env = process.env;

function getSystemProxyByUrl (parsedRequestUrl) {
  var systemProxyStr = null;
  if (parsedRequestUrl.protocol === 'https:') {
    systemProxyStr = env.HTTPS_PROXY || env.https_proxy 
        || env.HTTP_PROXY || env.http_proxy || null;
  } else if (parsedRequestUrl.protocol == 'http:') {
    systemProxyStr = env.HTTP_PROXY || env.http_proxy || null;
  }

  return systemProxyStr;
};

function getTunnelOptionsByProxy (parsedProxyUrl, parsedRequestUrl) {
  return {
    proxy: {
      host: parsedProxyUrl.hostname,
      port: parsedProxyUrl.port,
      headers: {
        host: parsedRequestUrl.host
      }
    }
  }
};

function getTunnelFnName(parsedProxyUrl, parsedRequestUrl) {
  var uriProtocol = (parsedRequestUrl.protocol === 'https:' ? 'https' : 'http')
  var proxyProtocol = (parsedProxyUrl.protocol === 'https:' ? 'Https' : 'Http')
  return [uriProtocol, proxyProtocol].join('Over')
}

/**
 * Get agent only if it has system proxy
 */
function getAgentByUrl (requestUrl) {
  if (!requestUrl) {
    return null;
  }
  var parsedRequestUrl = url.parse(requestUrl);
  var proxyUrl = getSystemProxyByUrl(parsedRequestUrl);
  if (!proxyUrl) {
    log.debug('No system proxy');
    return null;
  }

  log.debug('Detect system proxy Url: ' + proxyUrl);
  var parsedProxyUrl = url.parse(proxyUrl);
  var tunnelOptions = getTunnelOptionsByProxy(parsedProxyUrl, parsedRequestUrl);
  if (tunnelOptions) {
    var tunnelFnName = getTunnelFnName(parsedProxyUrl, parsedRequestUrl);
    log.debug('Tunnel name is ' + tunnelFnName);
    return tunnel[tunnelFnName](tunnelOptions);
  }
};

exports.getByUrl = getAgentByUrl;