const express = require('express');
const app = express();
const router = require('../router.js');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3000;

app.use(cors({ origin: true, credentials: true }));
app.use([
  bodyParser.json({ limit: '10mb', extended: false }),
  bodyParser.urlencoded({ extended: false }),
]);

app.use('/api', router);
app.listen(port, () =>
  console.log(`Mock server listening at http://localhost:${port}/api`)
);
a;
