const url = require('url');

module.exports = function getFullURL(req) {
  const root = url.format({
    protocol: req.protocol,
    host: req.headers.host,
  });
  return `${root}${req.originalUrl}`;
};
