const testCode = ({ path, method, status }) =>
  `pm.test("${path}:${method} status", () => {
  pm.expect(pm.response.to.have.status('${status}'));
});`;

const statusMethods = {
  POST: 'Created',
};

module.exports = ({ path, method }) => ({
  listen: 'test',
  script: {
    exec: testCode({ path, method, status: statusMethods[method] || 'OK' }).split(
      '\n'
    ),
    type: 'text/javascript',
  },
});
