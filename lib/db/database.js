const lodashId = require('lodash-id');
const low = require('lowdb');
const Memory = require('lowdb/adapters/Memory');
const validateData = require('./validate-data');
const mixins = require('./mixins');

module.exports = (dbData) => {
  const db = low(new Memory()).setState(dbData);
  validateData(db.getState());

  // Add lodash-id methods to db
  db._.mixin(lodashId);

  // Add json-server lowdb specific mixins (getRemovable, createId, deepQuery)
  db._.mixin(mixins);

  return db;
};
