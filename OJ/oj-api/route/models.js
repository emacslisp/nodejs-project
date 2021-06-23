
const user = require('../models/User.js');
global.User = vApp.mongoose.model(user.name, user.schema, user.collection);
