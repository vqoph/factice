/**
 * json-server logic  adaptation for serverless architecture
 * original : https://raw.githubusercontent.com/typicode/json-server/v0.16.1/src/server/router/singular.js
 */

module.exports = (db, name, opts) => {
  function destroy(req) {
    return { value: null };
  }

  function show() {
    return { value: db.get(name).value() };
  }

  function create(req) {
    db.set(name, req.body).value();
    return {
      value: db.get(name).value(),
      headers: [{ name: 'Access-Control-Expose-Headers', value: 'Location' }],
      status: 201,
    };
  }

  function update(req, res, next) {
    if (req.method === 'PUT') {
      db.set(name, req.body).value();
    } else {
      db.get(name).assign(req.body).value();
    }

    return { value: db.get(name).value() };
  }

  return [
    {
      key: name,
      get: show,
      post: create,
      put: update,
      patch: update,
      delete: destroy,
    },
  ];
};
