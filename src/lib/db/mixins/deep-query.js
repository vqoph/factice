module.exports = function deepQuery(value, q) {
  const _ = this;

  if (value && q) {
    if (_.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (_.deepQuery(value[i], q)) {
          return true;
        }
      }
    } else if (_.isObject(value) && !_.isArray(value)) {
      for (const k in value) {
        if (_.deepQuery(value[k], q)) {
          return true;
        }
      }
    } else if (value.toString().toLowerCase().indexOf(q) !== -1) {
      return true;
    }
  }
};
