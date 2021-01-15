/**
 * json-server logic  adaptation for serverless architecture
 * original : https://raw.githubusercontent.com/typicode/json-server/v0.16.1/src/server/router/plural.js
 */

const url = require('url');
const _ = require('lodash');
const filters = require('./filters');
const paginate = require('./paginate');
const { embed, expand, cleanQuery, foreignKeyIdKey } = require('./helpers');

module.exports = (db, name, opts = {}) => {
  // GET /name
  // GET /name?q=
  // GET /name?attr=&attr=
  // GET /name?end=&
  // GET /name?_end=&
  // GET /name?start=&end=&
  // GET /name?_start=&end=&
  // GET /name?embed=&expand=
  // GET /name?_embed=&_expand=
  function list(
    {
      query = {},
      protocol = 'http',
      originalUrl = undefined,
      headers: { host } = {},
    },
    { parentResourceName, parentId }
  ) {
    // Resource chain
    let chain = db.get(name);
    if (parentId) {
      const parentResKeyId = foreignKeyIdKey(parentResourceName, opts);
      chain = chain.filter(
        (item) =>
          item[parentResKeyId] &&
          item[parentResKeyId].toString() === parentId.toString()
      );
    }

    let links;
    // Remove q, start, end, ... from req.query to avoid filtering using those
    // parameters

    let { start, end, page, limit, ...lastingParameters } = cleanQuery(query);

    const {
      sort,
      order,
      embed: toEmbed,
      expand: toExpand,
      ...cleanedQuery
    } = lastingParameters;

    chain = filters(cleanedQuery, db, chain);

    // Sort
    if (sort) {
      const _sortSet = sort.split(',');
      const _orderSet = (order || '').split(',').map((s) => s.toLowerCase());
      chain = chain.orderBy(_sortSet, _orderSet);
    }

    const fullUrl =
      host && originalUrl && protocol
        ? `${url.format({ protocol, host })}${originalUrl}`
        : '';
    [chain, links] = paginate({ start, end, page, limit }, fullUrl, chain);

    // Slice result
    // embed and expand
    chain = chain.cloneDeep().map((element) => ({
      ...embed(element, { toEmbed, db, name, opts }),
      ...expand(element, { toExpand, db, opts }),
    }));

    const headers = [];
    if (end || limit || page) {
      headers.push({ name: 'X-Total-Count', value: chain.size() });
      headers.push({
        name: 'Access-Control-Expose-Headers',
        value: `X-Total-Count${page ? ', Link' : ''}`,
      });
    }

    return { value: chain.value(), headers, links };
  }

  // GET /name/:id
  // GET /name/:id?embed=&expand
  // GET /name/:id?_embed=&_expand
  function show({ query, params: { id } }) {
    const { embed: toEmbed, expand: toExpand } = cleanQuery(query);
    const resource = db.get(name).getById(id).value();
    if (!resource) return {};

    // Clone resource to avoid making changes to the underlying object
    let clone = _.cloneDeep(resource);

    clone = {
      ...embed(clone, { toEmbed, db, name, opts }),
      ...expand(clone, { toExpand, db, opts }),
    };

    return { value: clone };
  }

  // POST /name
  function create({ body }, { parentResourceName, parentId }) {
    if (parentId) {
      body[foreignKeyIdKey(parentResourceName, opts)] = parentId;
    }

    if (!opts.fake) {
      return { value: db.get(name).insert(body).value(), status: 201 };
    } else {
      return { value: body, status: 201 };
    }
  }

  // PUT /name/:id
  // PATCH /name/:id
  function update({ method, params, body }) {
    const id = params.id;
    let chain = db.get(name);
    if (!opts.fake) {
      chain =
        (method === 'PATCH' && chain.updateById(id, body)) ||
        chain.replaceById(id, body);
    }

    return { value: chain.value() };
  }

  // DELETE /name/:id
  function destroy({ params: { id } }) {
    if (!opts.fake) {
      db.get(name).removeById(id).value();
      // Remove dependents documents
      const removable = db._.getRemovable(db.getState(), opts);
      removable.forEach((item) => {
        db.get(item.name).removeById(item.id).value();
      });
    }
    return { value: null };
  }

  const { parentResources } = opts;
  return [
    {
      key: name,
      model: db.get(name),
      parentResources,
      methods: { get: list, post: create },
    },
    {
      key: `${name}/:id`,
      model: db.get(name),
      parentResources,
      methods: { get: show, put: update, patch: update, delete: destroy },
    },
  ];
};
