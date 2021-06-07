require('./controllers.js');
require('./services.js');

app.post('/v1/api/unixtime',jsonParser, vApp.JWTService.isAuthentication, vApp.TestController.test);
