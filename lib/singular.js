/**
 * json-server logic  adaptation for serverless architecture
 * original : https://raw.githubusercontent.com/typicode/json-server/v0.16.1/src/server/router/singular.js
 */

const getFullURL = require('./get-full-url');

module.exports = (db, name, opts) => {
  function show(req, res, next) {
    res.locals.data = db.get(name).value();
    next();
  }

  function create(req, res, next) {
    if (opts._isFake) {
      res.locals.data = req.body;
    } else {
      db.set(name, req.body).value();
      res.locals.data = db.get(name).value();
    }

    res.setHeader('Access-Control-Expose-Headers', 'Location');
    res.location(`${getFullURL(req)}`);

    res.status(201);
    next();
  }

  function update(req, res, next) {
    if (opts._isFake) {
      if (req.method === 'PUT') {
        res.locals.data = req.body;
      } else {
        const resource = db.get(name).value();
        res.locals.data = { ...resource, ...req.body };
      }
    } else {
      if (req.method === 'PUT') {
        db.set(name, req.body).value();
      } else {
        db.get(name).assign(req.body).value();
      }

      res.locals.data = db.get(name).value();
    }

    next();
  }

  return [{ key: name, get: show, post: create, put: update, patch: update }];
};
