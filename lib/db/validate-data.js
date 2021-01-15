'use strict';

const _ = require('lodash');

function validateKey(key) {
  if (key.indexOf('/') !== -1) {
    const msg = [
      `Oops, found / character in database property '${key}'. `,
      "/ aren't supported.",
    ].join('\n');
    throw new Error(msg);
  }
}

module.exports = (obj) => {
  if (_.isPlainObject(obj)) {
    Object.keys(obj).forEach(validateKey);
  } else {
    throw new Error(`Data must be an object. Found ${typeof obj}.`);
  }
};
