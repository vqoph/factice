const generateTests = require('./item-tests');

module.exports = ({ name, path, method, response, apiPath, headers = [] }) => {
  const cleanedPath = path.replace(
    /([a-z-0-]*)s\/\:([a-z-0-]*)/gim,
    '$1s/{{$1-$2}}'
  );
  const decoratedPath = !apiPath ? cleanedPath : `${apiPath}/${cleanedPath}`;
  const innerVariables = [...cleanedPath.matchAll(/\{\{([a-z-0-]*)\}\}/gi)].map(
    ([, v]) => v
  );

  return {
    name,
    event: [generateTests({ path, method })],
    innerVariables,
    request: {
      method,
      header: [
        {
          key: 'Content-Type',
          name: 'Content-Type',
          value: 'application/json',
          type: 'text',
        },
        ...headers,
      ],
      url: {
        raw: `{{protocol}}://{{host}}:{{port}}/${decoratedPath}`,
        protocol: '{{protocol}}',
        host: ['{{host}}'],
        port: '{{port}}',
        path: decoratedPath.split('/'),
      },
    },
    response,
  };
};
