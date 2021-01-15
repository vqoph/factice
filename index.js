const router = require('./lib/router/router');
const database = require('./lib/db/database');
const createActions = require('./lib/actions/reducer');
const now = require('./plugins/now');

module.exports = { router, database, createActions, now };
