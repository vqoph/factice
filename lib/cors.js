module.exports = () => (req, res, next) => {
  const headers = {
    'Access-Control-Allow-Origin': req.headers.origin,
    'Access-Control-Allow-Methods': 'POST, GET, PUT, UPDATE, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Headers':
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
  };
  Object.keys(headers).forEach((header) => res.setHeader(header, headers[header]));
  next();
};
