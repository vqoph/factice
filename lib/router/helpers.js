function parsePath(url) {
  let parentResourceName, parentId, resourceName, id;
  const parts = url.split('/').splice(1);
  const length = parts.length;
  switch (length.toString()) {
    case '1':
      [resourceName] = parts;
      break;
    case '2':
      [resourceName, id] = parts;
      break;
    default:
      // get the 3rds last parameters if length is odd or the 4ths if even
      if (length % 2 !== 0) {
        [parentResourceName, parentId, resourceName] = parts.splice(length - 3);
      } else {
        [parentResourceName, parentId, resourceName, id] = parts.splice(length - 4);
      }
      break;
  }

  return { parentResourceName, parentId, resourceName, id };
}

function handleOptionMethod(req, res) {
  res.end();
}

module.exports = { parsePath, handleOptionMethod };
