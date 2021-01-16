/**
 * json-server logic  adaptation for serverless architecture
 * original : https://raw.githubusercontent.com/typicode/json-server/v0.16.1/src/server/router/singular.js
 */

const pluralize = require('pluralize');

module.exports = (db, name, opts) => {
  function destroy() {
    if (!opts.fake) db.set(name, {}).value();
    return { value: null };
  }

  function show() {
    return { value: db.get(name).value() };
  }

  function create({ body }, { parentResourceName, parentId }) {
    let value = body;
    if (parentId) {
      const prop = pluralize.singular(parentResourceName);
      body[`${prop}${opts.foreignKeySuffix}`] = parentId;
    }

    if (!opts.fake) {
      db.set(name, body).value();
      value = db.get(name).value();
    }

    return {
      value,
      headers: [{ name: 'Access-Control-Expose-Headers', value: 'Location' }],
      status: 201,
    };
  }

  function update({ method, body }) {
    if (!opts.fake) {
      if (method === 'PUT') db.set(name, body).value();
      else db.get(name).assign(body).value();
    }
    return { value: db.get(name).value() };
  }
  const { parentResources } = opts;
  return [
    {
      key: name,
      parentResources,
      methods: {
        get: show,
        post: create,
        put: update,
        patch: update,
        delete: destroy,
      },
    },
  ];
};
