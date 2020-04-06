const _ = require('lodash');
const lodashId = require('lodash-id');
const low = require('lowdb');
const Memory = require('lowdb/adapters/Memory');
const validateData = require('json-server/lib/server/router/validate-data');
const mixins = require('json-server/lib/server/mixins');

module.exports = (dbData) => {
  const db = low(new Memory()).setState(dbData);
  validateData(db.getState());

  // Add lodash-id methods to db
  db._.mixin(lodashId);

  // Add specific mixins
  db._.mixin(mixins);

  return db;
};
