const pluralize = require('pluralize');

module.exports = function getRemovable(db, opts) {
  const _ = this;
  const removable = [];
  _.each(db, (coll, collName) => {
    _.each(coll, (doc) => {
      _.each(doc, (value, key) => {
        if (new RegExp(`${opts.foreignKeySuffix}$`).test(key)) {
          // Remove foreign key suffix and pluralize it
          // Example postId -> posts
          const refName = pluralize.plural(
            key.replace(new RegExp(`${opts.foreignKeySuffix}$`), '')
          ); // Test if table exists

          if (db[refName]) {
            // Test if references is defined in table
            const ref = _.getById(db[refName], value);

            if (_.isUndefined(ref)) {
              removable.push({
                name: collName,
                id: doc.id,
              });
            }
          }
        }
      });
    });
  });

  return removable;
}; // Return incremented id or uuid
// Used to override lodash-id's createId with utils.createId
