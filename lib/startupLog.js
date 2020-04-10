const logger = require('./logger');
const chalk = require('chalk');

module.exports = (initialMessage, actions) => {
  const resources = Object.keys(actions).reduce((acc, route) => {
    const action = { ...actions[route] };
    delete action.key;
    const methods = `{${Object.keys(action).join('|').toUpperCase()}}`;
    return acc + chalk`  {gray ->} {magenta ${methods}} /${route} \n`;
  }, '');

  let logMessage =
    chalk`\n\n${initialMessage} \n\n{white Resources:} \n` + resources;

  logger.info(logMessage, { raw: true });
};
