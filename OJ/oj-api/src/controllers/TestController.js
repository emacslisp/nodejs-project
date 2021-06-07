'use strict';
let moment = require('moment');

class TestController {
    constructor(){
        return this;
    }

    async test(req, res, next) {
        let unixTimeStamp = moment().format('x');
        res.json({unixTimeStamp});
    }
}

module.exports = TestController;
