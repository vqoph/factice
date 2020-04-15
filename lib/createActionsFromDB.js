const _ = require('lodash');
const singular = require('./singular');
const plural = require('./plural');
const pluralize = require('pluralize');

function getParentResources(value, ResKeys) {
  const itemKeys = Object.keys(value);
  return [...ResKeys]
    .filter(({ key, indexKey }) => itemKeys.includes(indexKey))
    .map(({ key }) => key);
}

module.exports = (db, opts) => {
  opts = { foreignKeySuffix: 'Id', ...opts };
  const ResKeys = Object.keys(db.getState()).map((key) => ({
    key,
    indexKey: pluralize(key, 1) + opts.foreignKeySuffix,
  }));

  const actions = db
    .reduce((acc, value, key) => {
      if (_.isPlainObject(value)) {
        const parentResources = getParentResources(value, ResKeys);
        return [...acc, ...singular(db, key, { ...opts, parentResources })];
      }

      if (_.isArray(value)) {
        const parentResources = getParentResources(value[0], ResKeys);
        return [...acc, ...plural(db, key, { ...opts, parentResources })];
      }

      throw new Error(
        `Type of "${key}" (${typeof value}) is not supported. ` +
          `Use objects or arrays of objects.`
      );
    }, [])
    .value()
    .reduce((acc, item) => ({ ...acc, [item.key]: item }), {});

  return actions;
};
