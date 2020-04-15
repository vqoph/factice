const UrlPattern = require('url-pattern');

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
    const { value, links, status, headers } = action(req);
    if (value === undefined) return errNotFound(req, res);

    if (status) res.status(status);
    if (links) res.links(links);

    if (headers) {
      headers.forEach(({ name, value }) => {
        res.setHeader(name, value);
      });
    }
    if (value) res.json(value);
    else res.send('');
  } catch (error) {
    return serverErr(req, res, error);
  }
};
