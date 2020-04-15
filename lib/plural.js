/**
 * json-server logic  adaptation for serverless architecture
 * original : https://raw.githubusercontent.com/typicode/json-server/v0.16.1/src/server/router/plural.js
 */

const url = require('url');
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
  function list({ query, protocol, originalUrl, headers: { host } }) {
    // Resource chain
    let chain = db.get(name);
    let links;
    // Remove q, _start, _end, ... from req.query to avoid filtering using those
    // parameters
    let { _start, _end, _page, _limit, ...lastingParameters } = query;
    const { _sort, _order, _embed, _expand, ...cleanedQuery } = lastingParameters;

    chain = filters(cleanedQuery, db, chain);

    // Sort
    if (_sort) {
      const _sortSet = _sort.split(',');
      const _orderSet = (_order || '').split(',').map((s) => s.toLowerCase());
      chain = chain.orderBy(_sortSet, _orderSet);
    }
    const fullUrl = `${url.format({ protocol, host })}${originalUrl}`;
    [chain, links] = paginate({ _start, _end, _page, _limit }, fullUrl, chain);

    // Slice result
    // embed and expand
    chain = chain.cloneDeep().forEach((element) => {
      embed(element, _embed);
      expand(element, _expand);
    });

    const headers = [];
    if (_end || _limit || _page) {
      headers.push({ name: 'X-Total-Count', value: chain.size() });
      headers.push({
        name: 'Access-Control-Expose-Headers',
        value: `X-Total-Count${_page ? ', Link' : ''}`,
      });
    }

    return { value: chain.value(), headers, links };
  }

  // GET /name/:id
  // GET /name/:id?_embed=&_expand
  function show({ query, params: { id } }) {
    const { _embed, _expand } = query;
    const resource = db.get(name).getById(id).value();
    if (!resource) return {};

    // Clone resource to avoid making changes to the underlying object
    const clone = _.cloneDeep(resource);

    // Embed other resources based on resource id
    // /posts/1?_embed=comments
    embed(clone, _embed);

    // Expand inner resources based on id
    // /posts/1?_expand=user
    expand(clone, _expand);

    return { value: clone };
  }

  // POST /name
  function create({ body }) {
    return { value: db.get(name).insert(body).value(), status: 201 };
  }

  // PUT /name/:id
  // PATCH /name/:id
  function update({ method, params, body }) {
    const id = params.id;
    let chain = db.get(name);
    chain =
      (method === 'PATCH' && chain.updateById(id, body)) ||
      chain.replaceById(id, body);

    return { value: chain.value() };
  }

  // DELETE /name/:id
  function destroy({ params: { id } }) {
    db.get(name).removeById(id).value();
    // Remove dependents documents
    const removable = db._.getRemovable(db.getState(), opts);
    removable.forEach((item) => {
      db.get(item.name).removeById(item.id).value();
    });

    return { value: null };
  }

  return [
    { key: `${name}`, get: list, post: create },
    { key: `${name}/:id`, get: show, put: update, patch: update, delete: destroy },
  ];
};
