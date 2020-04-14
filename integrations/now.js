const router = require('../lib/router');
const createActions = require('../lib/actions');
const startupLog = require('../lib/startupLog');
const database = require('../lib/db');

module.exports = (data) => {
  const db = database(data);
  const actions = createActions(db);
  startupLog('', actions);
  return router({ actions });
};
