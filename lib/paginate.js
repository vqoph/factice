const _ = require('lodash');
const utils = require('json-server/lib/server/utils');
const getFullURL = require('./get-full-url');

module.exports = ({ _start, _end, _page, _limit }, req, chain) => {
  if (_page) {
    _page = parseInt(_page, 10);
    _page = _page >= 1 ? _page : 1;
    _limit = parseInt(_limit, 10) || 10;
    const page = utils.getPage(chain.value(), _page, _limit);
    const links = {};
    const fullURL = getFullURL(req);

    if (page.first) {
      links.first = fullURL.replace(`page=${page.current}`, `page=${page.first}`);
    }

    if (page.prev) {
      links.prev = fullURL.replace(`page=${page.current}`, `page=${page.prev}`);
    }

    if (page.next) {
      links.next = fullURL.replace(`page=${page.current}`, `page=${page.next}`);
    }

    if (page.last) {
      links.last = fullURL.replace(`page=${page.current}`, `page=${page.last}`);
    }

    chain = _.chain(page.items);
    return [chain, links];
  } else if (_end) {
    _start = parseInt(_start, 10) || 0;
    _end = parseInt(_end, 10);
    chain = chain.slice(_start, _end);
  } else if (_limit) {
    _start = parseInt(_start, 10) || 0;
    _limit = parseInt(_limit, 10);
    chain = chain.slice(_start, _start + _limit);
  }
  return [chain];
};
