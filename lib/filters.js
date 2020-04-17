const _ = require('lodash');

module.exports = (originalQuery, db, chain) => {
  let { q, ...query } = originalQuery;

  // convert LHS brackets and RHS colons to underscored parameters
  Object.keys(query).forEach((name) => {
    const item = query[name];
    const isRHS = typeof item === 'string' && /:/.test(item);
    const isLHS = _.isPlainObject(item);

    if (isLHS || isRHS) {
      let filter, value;
      if (isRHS) {
        [filter, value] = item.split(':');
      } else {
        [filter] = Object.keys(item);
        value = item[filter];
      }
      const underscoredName = `${name}_${filter}`;
      query[underscoredName] = value;
      delete query[name];
    }
  });

  // Automatically delete query parameters that can't be found
  // in the database
  Object.keys(query).forEach((name) => {
    const arr = chain.value();
    for (const i in arr) {
      if (
        _.has(arr[i], name) ||
        query === 'callback' ||
        query === '_' ||
        /_(lte|gte|ne|like)$/.test(name)
      )
        return;
    }
    delete query[name];
  });

  if (q) {
    // Full-text search
    if (Array.isArray(q)) {
      q = q[0];
    }

    q = q.toLowerCase();

    chain = chain.filter((obj) => {
      for (const key in obj) {
        const value = obj[key];
        if (db._.deepQuery(value, q)) return true;
      }
    });
  }

  Object.keys(query).forEach((key) => {
    // Don't take into account JSONP query parameters
    // jQuery adds a '_' query parameter too
    if (key === 'callback' || key === '_') return;

    // Always use an array, in case query is an array
    const arr = [].concat(query[key]);

    const isDifferent = /_ne$/.test(key);
    const isRange = /_(lte|gte)$/.test(key);
    const isLike = /_like$/.test(key);
    const path = key.replace(/_(lte|gte|ne|like)$/, '');

    chain = chain.filter((element) => {
      // get item value based on path
      // i.e post.title -> 'foo'
      const elementValue = _.get(element, path);
      return arr
        .map((value) => {
          // Prevent toString() failing on undefined or null values
          if (elementValue === undefined || elementValue === null) return;
          if (isRange) {
            const isLowerThan = /_gte$/.test(key);
            return isLowerThan ? value <= elementValue : value >= elementValue;
          } else if (isDifferent) {
            return value !== elementValue.toString();
          } else if (isLike) {
            return new RegExp(value, 'i').test(elementValue.toString());
          } else {
            return value === elementValue.toString();
          }
        })
        .reduce((a, b) => (isDifferent ? a && b : a || b));
    });
  });

  return chain;
};
