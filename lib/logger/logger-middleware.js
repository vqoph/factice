const logger = require('./logger');
const chalk = require('chalk');

module.exports = (req, res, next) => {
  const { method, url } = req;
  logger.info(chalk`{white ${url} ${method}}`, { scope: 'router' });
  next();
};
