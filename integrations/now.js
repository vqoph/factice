const router = require('../lib/router');
const createActionsFromDB = require('../lib/createActionsFromDB');
const startupLog = require('../lib/startupLog');
const database = require('../lib/db');

module.exports = (data) => {
  const db = database(data);
  const actions = createActionsFromDB(db);
  startupLog('', actions);
  return router({ actions });
};
