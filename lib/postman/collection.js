const _ = require('lodash');
const path = require('path');
const database = require('../db');
const createActions = require('../actions/reducer');
const generateItem = require('./collection-item');
const logger = require('../logger/logger');

function generateVariable({ key, value, type = 'string' }) {
  return { key, value, type };
}

function generateItems(methods, { apiPath, path }) {
  return Object.keys(methods).reduce(
    (mAcc, mKeys) => [
      ...mAcc,
      generateItem({
        method: mKeys.toUpperCase(),
        path,
        name: path,
        apiPath,
      }),
    ],
    []
  );
}

module.exports = (config) => {
  const {
    source,
    port = '3000',
    host = 'localhost',
    protocol = 'http',
    apiPath = 'api',
    name = 'no-name',
  } = config;

  const api = require(path.resolve(process.cwd() + '/' + source));

  const db = database(api);
  const actions = createActions(db, config);

  const postmanCollection = {
    info: {
      name,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },

    item: Object.keys(actions).reduce((acc, key) => {
      const item = actions[key];
      const { parentResources, key: path, ...methods } = item;
      let items = generateItems(methods, { apiPath, path });

      if (parentResources)
        parentResources.forEach((pKey) => {
          const {
            key: firstLvlPath,
            parentResources: pr1,
            ...firstLvlMethods
          } = actions[pKey];

          const {
            key: secondLvlPath,
            parentResources: pr2,
            ...secondLvlMethods
          } = actions[pKey + '/:id'];

          items = [
            ...items,
            ...generateItems(
              path.match(':id') ? secondLvlMethods : firstLvlMethods,
              {
                apiPath,
                path: secondLvlPath + '/' + path,
              }
            ),
          ];
        });

      return [...acc, ...items];
    }, []),

    variable: [
      generateVariable({ key: 'protocol', value: protocol }),
      generateVariable({ key: 'host', value: host }),
      generateVariable({ key: 'port', value: port.toString() }),
    ],
  };

  // generate inner request variables
  postmanCollection.item = postmanCollection.item.map((rawElement) => {
    const { innerVariables, ...item } = rawElement;
    const variables = innerVariables.map((key) =>
      generateVariable({ key, value: 'first' })
    );
    postmanCollection.variable = [...postmanCollection.variable, ...variables];
    return item;
  });

  postmanCollection.variable = _.uniqBy(postmanCollection.variable, 'key');

  return postmanCollection;
};
