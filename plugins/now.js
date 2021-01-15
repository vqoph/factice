const router = require('../lib/router/router');
const createActionsFromDB = require('../lib/actions/reducer');
const startupLog = require('../lib/startup-log');
const database = require('../lib/db/database');

/**
 *
 * @param {any} data
 * @param {{watch: false, noCors: false, delay: number, fake: false,quiet: false}} optsParams
 */

module.exports = (data, optsParams = {}) => {
  const opts = {
    watch: false,
    noCors: false,
    delay: undefined,
    fake: false,
    quiet: false,
    ...optsParams,
  };
  if (!data) throw new Error('Need data');
  const db = database(data);
  const actions = createActionsFromDB(db);
  startupLog('', actions);
  return router({ actions, opts });
};

module.exports();
