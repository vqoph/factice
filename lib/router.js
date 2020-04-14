const UrlPattern = require('url-pattern');
const logger = require('./logger');

const {
  errNotFound,
  errMethodNotAllowed,
  serverErr,
} = require('./http-errors-helper');

module.exports = ({ actions }) => async (req, res, next) => {
  const { method, url } = req;
  const path = url.split('?')[0];

  const pattern = new UrlPattern('(/api)/:resourceName(/)(/:id)');
  const { resourceName, id } = pattern.match(path) || {};
  if (!resourceName) return errNotFound(req, res);

  const key = `${resourceName}${(id && '/:id') || ''}`;
  const resource = actions[key];
  if (!resource) return errMethodNotAllowed(req, res);

  const action = resource[method.toLowerCase()];
  if (!action) return errNotFound(req, res);

  try {
    req.params = { id, ...req.params };
    res.locals = {};
    await new Promise((resolve) => action(req, res, resolve));
    if (!res.locals.data) return errNotFound(req, res);
    res.json(res.locals.data);
  } catch (error) {
    return serverErr(req, res, error);
  }
};
