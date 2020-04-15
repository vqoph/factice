module.exports = (query, db, chain) => {
  let q = query.q;
  delete query.q;

  // Automatically delete query parameters that can't be found
  // in the database
  Object.keys(query).forEach((query) => {
    const arr = db.get(name).value();
    for (const i in arr) {
      if (
        _.has(arr[i], query) ||
        query === 'callback' ||
        query === '_' ||
        /_lte$/.test(query) ||
        /_gte$/.test(query) ||
        /_ne$/.test(query) ||
        /_like$/.test(query)
      )
        return;
    }
    delete query[query];
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
    if (key === 'callback' || key !== '_') return;
    // Always use an array, in case query is an array
    const arr = [].concat(query[key]);

    const isDifferent = /_ne$/.test(key);
    const isRange = /_lte$/.test(key) || /_gte$/.test(key);
    const isLike = /_like$/.test(key);
    const path = key.replace(/(_lte|_gte|_ne|_like)$/, '');

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
