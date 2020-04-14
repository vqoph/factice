const jsonServerLite = require('json-server-lite/integrations/now');
const data = require('./api.json');
module.exports = jsonServerLite(data);
