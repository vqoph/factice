const _ = require('lodash');
const singular = require('./singular');
const plural = require('./plural');

module.exports = (db) => {
  const opts = { foreignKeySuffix: 'Id', _isFake: false };
  const actions = db
    .reduce((acc, value, key) => {
      if (_.isPlainObject(value)) return [...acc, ...singular(db, key, opts)];
      if (_.isArray(value)) return [...acc, ...plural(db, key, opts)];

      throw new Error(
        `Type of "${key}" (${typeof value}) is not supported. ` +
          `Use objects or arrays of objects.`
      );
    }, [])
    .value()
    .reduce((acc, item) => ({ ...acc, [item.key]: item }), {});

  return actions;
};
