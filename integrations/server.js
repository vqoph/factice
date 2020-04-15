const path = require('path');
const express = require('express');
const cors = require('cors');
const chokidar = require('chokidar');
const bodyParser = require('body-parser');

const database = require('../lib/db');
const router = require('../lib/router');
const logger = require('../lib/logger');
const loggerMiddleware = require('../lib/loggerMiddleware');
const createActions = require('../lib/actions');
const startupLog = require('../lib/startupLog');

module.exports = (config) => {
  const {
    _: [source],
    port,
    host,
    'no-cors': noCors,
    watch: watchFiles,
  } = config;

  let server = null;

  const api = require(path.resolve(process.cwd() + '/' + source));

  const db = database(api);
  const actions = createActions(db);
  const app = express();

  app.use([
    bodyParser.json({ limit: '10mb', extended: false }),
    bodyParser.urlencoded({ extended: false }),
  ]);

  app.use(loggerMiddleware);
  app.use('/api', router({ actions }));

  if (!noCors) app.use(cors({ origin: true, credentials: true }));

  function start() {
    server = app.listen(port, () => {
      logger.info('Start server', { scope: 'server' });
      startupLog(`Server listening at http://${host}:${port}/api`, actions);
    });
  }

  function restart() {
    server.close(() => {
      logger.info('Server restart', { scope: 'server' });
      start();
    });
  }

  if (watchFiles) {
    const watcher = chokidar.watch((watchFiles && watchFiles.toString()) || source, {
      ignored: [/(^|[\/\\])\../, (path) => path.includes('node_modules')],
      persistent: true,
    });

    watcher.on('all', (event, path) => {
      switch (event) {
        case 'add':
          logger.info(`Watching for ${path}`, { scope: 'watcher' });
          break;

        case 'change':
          logger.info(`${path} changed`, { scope: 'watcher' });
          restart();
          break;

        default:
          break;
      }
    });
  }

  start();
};