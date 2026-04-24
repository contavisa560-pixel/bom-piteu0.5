const UAParser = require('ua-parser-js');

function detectDevice(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Desconhecido',
    browserVersion: result.browser.version,
    os: result.os.name || 'Desconhecido',
    osVersion: result.os.version,
    device: result.device.type || 'desktop',
    deviceModel: result.device.model || '',
    vendor: result.device.vendor || '',
    ua: userAgent
  };
}

module.exports = { detectDevice };