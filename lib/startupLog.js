const logger = require('./logger');
const chalk = require('chalk');

module.exports = ({ host, port, actions }) => {
  const baseUrl = `http://${host}:${port}/api`;
  const resources = Object.keys(actions)
    .reduce((acc, route) => {
      const { key, parentResources, ...action } = { ...actions[route] };
      const methods = `{${Object.keys(action).join('|').toUpperCase()}}`;
      acc = [...acc, { methods, baseUrl, route }];

      parentResources.forEach((resource) => {
        acc = [...acc, { methods, baseUrl, route: resource + '/:id/' + route }];
      });

      return acc;
    }, [])
    //.sort(({ route }, { route: compareRoute }) => route - compareRoute)
    .map(
      ({ methods, baseUrl, route }) =>
        chalk`  {magenta ->} {gray ${baseUrl}}/${route} {magenta ${methods}} \n`
    )
    .sort()
    .join('');

  let logMessage =
    `---------------------------------------------\n` +
    chalk`Server listening at {blue ${baseUrl}}` +
    `\n---------------------------------------------\n` +
    chalk`{white Resources:}\n` +
    resources;

  logger.info(logMessage, { raw: true });
};
