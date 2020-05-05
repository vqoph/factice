const jsonServerLite = require('factice/integrations/now');
const data = require('./api.json');
module.exports = jsonServerLite(data);
