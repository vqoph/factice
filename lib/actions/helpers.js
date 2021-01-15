const pluralize = require('pluralize');
const camelCase = require('camelcase');
// Embed function used in GET /name and GET /name/id

function embed(resource, { toEmbed, name, db, opts }) {
  toEmbed &&
    [].concat(toEmbed).forEach((externalResource) => {
      if (db.get(externalResource).value) {
        const query = {};
        query[foreignKeyIdKey(name, opts)] = resource.id;
        resource[camelCase(pluralize(externalResource))] = db
          .get(externalResource)
          .filter(query)
          .value();
      }
    });

  return resource;
}

// Expand function used in GET /name and GET /name/id
function expand(resource, { toExpand, db, opts }) {
  toExpand &&
    [].concat(toExpand).forEach((innerResource) => {
      const plural = pluralize(innerResource);
      if (db.get(plural).value()) {
        const prop = foreignKeyIdKey(innerResource, opts);
        resource[camelCase(innerResource)] = db
          .get(plural)
          .getById(resource[prop])
          .value();
      }
    });
  return resource;
}

function cleanQuery(query) {
  const queryKeys = Object.keys(query);
  return queryKeys
    .map((key) => [key.replace(/^_/, ''), query[key]])
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

function foreignKeyIdKey(resourceName, opts = {}) {
  const prop = pluralize.singular(camelCase(resourceName));
  return `${prop}${opts.foreignKeySuffix || 'Id'}`;
}

function getParentResources(value, ResKeys) {
  const itemKeys = Object.keys(value);
  return [...ResKeys]
    .filter(({ indexKey }) => itemKeys.includes(indexKey))
    .map(({ key }) => key);
}

module.exports = { embed, expand, cleanQuery, foreignKeyIdKey, getParentResources };
