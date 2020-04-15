const logger = require('./logger');

function messagePrefix(req) {
  const { method, url } = req;
  return `${method} ${url}`;
}

function errNotFound(req, res) {
  const message = `${messagePrefix(req)} Not Found`;
  logger.error(message, { scope: 'router' });
  return res.status(404).json({ message });
}

function errMethodNotAllowed(req, res) {
  const message = `${messagePrefix(req)}  Method Not Allowed`;
  logger.error(message, { scope: 'router' });
  return res.status(405).json({ message });
}

function serverErr(req, res, error) {
  const stack = (process.env.NODE_ENV === 'development' && error.stack) || undefined;

  logger.error(error.toString(), {
    scope: 'router',
    stack,
  });

  return res.status(500).json({
    message: 'Server Error',
    error: error.toString(),
    stack: stack ? stack.replace(/    at /gi, '').split('\n') : undefined,
  });
}

module.exports = { errNotFound, errMethodNotAllowed, serverErr };
