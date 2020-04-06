function errNotFound(res) {
  return res.status(404).json({ message: 'Not Found' });
}

function errMethodNotAllowed(res) {
  return res.status(405).json({ message: 'Method Not Allowed' });
}

function serverErr(res, error) {
  return res.status(500).json({ message: 'Server Error', error: error.toString() });
}

module.exports = { errNotFound, errMethodNotAllowed, serverErr };
