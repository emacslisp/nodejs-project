const app = require('express')();
let serveStatic = require('serve-static');
let bodyParser = require('body-parser');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(serveStatic(__dirname + '/public'));

app.listen(8080)
console.log('listening on port 8080');