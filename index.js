const router = require('./lib/router/router');
const database = require('./lib/db');
const createActions = require('./lib/actions/reducer');
const now = require('./lib/now');

module.exports = { router, database, createActions, now };
