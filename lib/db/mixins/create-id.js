const nanoid = require('nanoid');

module.exports = function createId(coll) {
  const _ = this;

  const idProperty = _.__id();

  if (_.isEmpty(coll)) {
    return 1;
  } else {
    let id = _(coll).maxBy(idProperty)[idProperty]; // Increment integer id or generate string id

    return _.isFinite(id) ? ++id : nanoid(7);
  }
};
