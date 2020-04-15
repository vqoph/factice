/**
 * json-server logic  adaptation for serverless architecture
 * original : https://raw.githubusercontent.com/typicode/json-server/v0.16.1/src/server/router/plural.js
 */

const _ = require('lodash');
const pluralize = require('pluralize');
const filters = require('./filters');
const paginate = require('./paginate');

module.exports = (db, name, opts) => {
  // Embed function used in GET /name and GET /name/id
  function embed(resource, e) {
    e &&
      [].concat(e).forEach((externalResource) => {
        if (db.get(externalResource).value) {
          const query = {};
          const singularResource = pluralize.singular(name);
          query[`${singularResource}${opts.foreignKeySuffix}`] = resource.id;
          resource[externalResource] = db
            .get(externalResource)
            .filter(query)
            .value();
        }
      });
  }

  // Expand function used in GET /name and GET /name/id
  function expand(resource, e) {
    e &&
      [].concat(e).forEach((innerResource) => {
        const plural = pluralize(innerResource);
        if (db.get(plural).value()) {
          const prop = `${innerResource}${opts.foreignKeySuffix}`;
          resource[innerResource] = db.get(plural).getById(resource[prop]).value();
        }
      });
  }

  // GET /name
  // GET /name?q=
  // GET /name?attr=&attr=
  // GET /name?_end=&
  // GET /name?_start=&_end=&
  // GET /name?_embed=&_expand=
  function list(req, res, next) {
    // Resource chain
    let chain = db.get(name);
    // Remove q, _start, _end, ... from req.query to avoid filtering using those
    // parameters
    let { _start, _end, _page, _limit, ...lastingParameters } = req.query;
    const { _sort, _order, _embed, _expand, ...cleanedQuery } = lastingParameters;

    chain = filters(cleanedQuery, db, chain);

    // Sort
    if (_sort) {
      const _sortSet = _sort.split(',');
      const _orderSet = (_order || '').split(',').map((s) => s.toLowerCase());
      chain = chain.orderBy(_sortSet, _orderSet);
    }

    [chain, links] = paginate({ _start, _end, _page, _limit }, req, chain);

    if (links) res.links(links);

    // Slice result
    if (_end || _limit || _page) {
      res.setHeader('X-Total-Count', chain.size());
      res.setHeader(
        'Access-Control-Expose-Headers',
        `X-Total-Count${_page ? ', Link' : ''}`
      );
    }

    // embed and expand
    chain = chain.cloneDeep().forEach(function (element) {
      embed(element, _embed);
      expand(element, _expand);
    });

    res.locals.data = chain.value();
    next();
  }

  // GET /name/:id
  // GET /name/:id?_embed=&_expand
  function show(req, res, next) {
    const { _embed, _expand } = req.query;
    const resource = db.get(name).getById(req.params.id).value();

    if (resource) {
      // Clone resource to avoid making changes to the underlying object
      const clone = _.cloneDeep(resource);

      // Embed other resources based on resource id
      // /posts/1?_embed=comments
      embed(clone, _embed);

      // Expand inner resources based on id
      // /posts/1?_expand=user
      expand(clone, _expand);

      res.locals.data = clone;
    }

    next();
  }

  // POST /name
  function create(req, res, next) {
    const resource = db.get(name).insert(req.body).value();
    res.status(201);
    res.locals.data = resource;

    next();
  }

  // PUT /name/:id
  // PATCH /name/:id
  function update(req, res, next) {
    const id = req.params.id;
    let resource;

    let chain = db.get(name);

    chain =
      req.method === 'PATCH'
        ? chain.updateById(id, req.body)
        : chain.replaceById(id, req.body);

    resource = chain.value();

    if (resource) {
      res.locals.data = resource;
    }

    next();
  }

  // DELETE /name/:id
  function destroy(req, res, next) {
    const resource = db.get(name).removeById(req.params.id).value();

    // Remove dependents documents
    const removable = db._.getRemovable(db.getState(), opts);
    removable.forEach((item) => {
      db.get(item.name).removeById(item.id).value();
    });

    if (resource) {
      res.locals.data = {};
    }

    next();
  }

  return [
    { key: `${name}`, get: list, post: create },
    { key: `${name}/:id`, get: show, put: update, patch: update, delete: destroy },
  ];
};
