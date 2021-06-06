express = require('express');

app = express();
router = express.Router();

global.config = require('./environments/development.json');

bodyParser = require('body-parser');

jsonParser = bodyParser.json();


global.vApp = {};
vApp.debug = console;

app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))

require('./route/router.js');
app.use(vApp.JWTService.isAuthentication);

app.get('/', function (req, res) {
  res.send('no content!')
});

app.listen(6000, function () {
  console.log('Node API listening on port 3090!')
});
