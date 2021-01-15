function getPage(allItems, page, perPage) {
  const start = (page - 1) * perPage;
  const end = page * perPage;
  const items = allItems.slice(start, end);
  const prev = page > 1 ? page - 1 : undefined;
  const next = end < items.length ? page + 1 : undefined;
  let current, first, last;

  if (items.length !== allItems.length) {
    current = page;
    first = 1;
    last = Math.ceil(items.length / perPage);
  }

  return { links: { prev, next, current, first, last }, items };
}

/**
 *
 * @param {{
 *  start:string|number|undefined,
 *  page:string|number|undefined,
 *  end:string|number|undefined,
 *  limit:string|number|undefined
 * }} pagination
 *
 * @param {string} fullUrl
 * @param { any } chain
 */

module.exports = (pagination, fullUrl, chain) => {
  const _ = chain._;

  let { start, page, end, limit } = _.mapValues(
    pagination,
    (value) => parseInt(value, 10) || 0
  );

  if (page) {
    page = page >= 1 ? page : 1;
    limit = limit || 10;

    const { items, links: linksData } = getPage(chain.value(), page, limit);
    const links = _.mapValues(linksData, (value) =>
      fullUrl.replace(`page=${linksData.current}`, `page=${value}`)
    );

    return [_.chain(items), links];
  }

  if (end) {
    return [chain.slice(start, end)];
  } else if (limit) {
    return [chain.slice(start, start + limit)];
  }

  return [chain];
};
