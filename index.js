const router = require('./lib/router');
const database = require('./lib/db');
const createActionsFromDB = require('./lib/actions-reducer');
module.exports = { router, database, createActionsFromDB };
