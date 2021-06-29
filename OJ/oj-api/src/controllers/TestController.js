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

    async post(req, res, next) {
        const posts = [
            {
                id: 1,
                author: 'John',
                title: 'Templating with EJS',
                body: 'Blog post number 1'
            },
            {
                id: 2,
                author: 'Drake',
                title: 'Express: Starting from the Bottom',
                body: 'Blog post number 2'
            },
            {
                id: 3,
                author: 'Emma',
                title: 'Streams',
                body: 'Blog post number 3'
            },
            {
                id: 4,
                author: 'Cody',
                title: 'Events',
                body: 'Blog post number 4'
            }
        ];
        res.json(posts);
    }
}

module.exports = TestController;
