const { parsePath, handleOptionMethod } = require('./helpers');
const { errNotFound, errMethodNotAllowed, serverErr } = require('./errors');

module.exports = ({ actions, opts = {} }) => async (req, res) => {
  const { method, url } = req;

  if (!opts.noCors && method === 'OPTIONS') return handleOptionMethod(req, res);

  const path = url.split('?')[0].replace('(/|)api', '');

  const { resourceName, id, ...extraParameters } = parsePath(path);
  if (!resourceName) return errNotFound(req, res);

  let key = `${resourceName}${(id && '/:id') || ''}`;
  const resource = actions[key];
  if (!resource) return errMethodNotAllowed(req, res);

  const action = resource.methods[method.toLowerCase()];
  if (!action) return errNotFound(req, res);

  try {
    req.params = { id, ...req.params };
    const { value, links, status, headers } = action(req, extraParameters);
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
