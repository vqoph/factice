const router = require('../lib/router');
const createActions = require('../lib/actions');
const startupLog = require('../lib/startupLog');

const api = require(process.cwd() + (process.env.JSON_MOCKS || '/mocks/api.json'));
const db = database(api);
const actions = createActions(db);
startupLog('', actions);
module.exports = router({ actions });
