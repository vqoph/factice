const logger = require('./logger');
const chalk = require('chalk');

module.exports = ({ host, port, actions }) => {
  const baseUrl = `http://${host}:${port}/api`;
  const resources = Object.keys(actions).reduce((acc, route) => {
    const action = { ...actions[route] };
    delete action.key;
    const methods = `{${Object.keys(action).join('|').toUpperCase()}}`;
    return (
      acc + chalk`  {gray ->} {magenta ${methods}} {gray ${baseUrl}}/${route} \n`
    );
  }, '');

  let logMessage =
    `---------------------------------------------\n` +
    chalk`Server listening at {blue ${baseUrl}}` +
    `\n---------------------------------------------\n` +
    chalk`{white Resources:}\n` +
    resources;

  logger.info(logMessage, { raw: true });
};
