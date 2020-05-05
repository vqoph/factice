const pluralize = require('pluralize');
const { foreignKeyIdKey, getParentResources } = require('./helpers');
const _ = require('lodash');
const singular = require('./singular');
const plural = require('./plural');

module.exports = (db, opts) => {
  opts = { foreignKeySuffix: 'Id', ...opts };
  const ResKeys = Object.keys(db.getState()).map((key) => ({
    key,
    indexKey: foreignKeyIdKey(key, opts),
  }));

  const actions = db
    .reduce((acc, value, key) => {
      if (_.isPlainObject(value)) {
        if (pluralize.isPlural(key))
          throw new Error('Singular routes must have names in the singular');

        const parentResources = getParentResources(value, ResKeys);
        return [...acc, ...singular(db, key, { ...opts, parentResources })];
      }

      if (_.isArray(value)) {
        if (pluralize.isSingular(key))
          throw new Error('Plural routes should be plural named');

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
