const lodashId = require('lodash-id');
const low = require('lowdb');
const Memory = require('lowdb/adapters/Memory');
const validateData = require('./validate-data');
const CreateId = require('./mixins/create-id');
const GetRemovables = require('./mixins/get-removables');
const DeepQuery = require('./mixins/deep-query');

module.exports = (dbData) => {
  const db = low(new Memory()).setState(dbData);
  validateData(db.getState());

  // Add lodash-id methods to db
  db._.mixin(lodashId);

  // Add json-server lowdb specific mixins (getRemovable, createId, deepQuery)
  db._.mixin({ CreateId, GetRemovables, DeepQuery });

  return db;
};
