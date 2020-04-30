const router = require('../lib/router');
const createActionsFromDB = require('./actions/reducer');
const startupLog = require('./startup-log');
const database = require('./db');

module.exports = (data) => {
  const db = database(data);
  const actions = createActionsFromDB(db);
  startupLog('', actions);
  return router({ actions });
};
