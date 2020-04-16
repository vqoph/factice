const router = require('../lib/router');
const createActionsFromDB = require('../lib/actions-reducer');
const startupLog = require('../lib/startup-log');
const database = require('../lib/db');

module.exports = (data) => {
  const db = database(data);
  const actions = createActionsFromDB(db);
  startupLog('', actions);
  return router({ actions });
};
