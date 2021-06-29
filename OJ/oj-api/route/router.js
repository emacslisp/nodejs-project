require('./controllers.js');
require('./services.js');
require('./bases.js');

app.post('/v1/api/unixtime',jsonParser, vApp.JWTService.isAuthentication, vApp.TestController.test);
app.post('/posts',jsonParser, vApp.JWTService.isAuthentication, vApp.TestController.post);
