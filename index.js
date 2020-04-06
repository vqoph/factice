const UrlPattern = require('url-pattern');
const database = require('./lib/db');
const createActions = require('./lib/actions');

const {
  errNotFound,
  errMethodNotAllowed,
  serverErr,
} = require('./lib/http-errors-helper');

const api = require('../mocks/api');

const db = database(api);
const actions = createActions(db);

module.exports = async (req, res, next) => {
  const { method, url } = req;

  const pattern = new UrlPattern('(/api)/:resourceName(/)(/:id)');
  const { resourceName, id } = pattern.match(url) || {};
  if (!resourceName) return errNotFound(res);

  const key = `${resourceName}${(id && '/:id') || ''}`;
  const resource = actions[key];
  if (!resource) return errMethodNotAllowed(res);

  const action = resource[method.toLowerCase()];
  if (!action) return errNotFound(res);

  try {
    req.params = { id, ...req.params };
    res.locals = {};
    await new Promise((resolve) => action(req, res, resolve));
    if (!res.locals.data) return errNotFound(res);
    res.json(res.locals.data);
  } catch (error) {
    console.log(error);
    return serverErr(res, error);
  }
};
