'use strict';
/* global vApp */
let jwt = require('jsonwebtoken');
let tokenExpiry = 60 * 60 * 24; // Default to a day
/**
 * IMPORTANT: JWTServices must be a ES6 Javascript class
 */
class JWTService {
    constructor(){
        return this;
    }

    async isAuthentication(req, res, next) {
        console.log(req.method, ' - ', req.url);
        
        try {
            if (req.headers.authorization) {
                console.log(req.headers.authorization);
                let result;
                switch(req.headers.authorization.split(' ')[0]) {
                case 'Bearer':
                    await this.verifyCredential(req.headers.authorization.split(' ')[1]);
                    break;
                case 'api-key':
                    result = req.headers.authorization.split(' ')[1];
                    if (result && result !== config.ojApi.defaultApiKey) {
                        return res.status(401).json({ error: 'API Key is invalid!!!' });
                    }
                    break;
                default:
                    return res.status(401).json({ error: 'JWT Token is invalid!!!' });                    
                }
            }
            else
                return res.status(401).json({ error: 'Token expired or invalid' });
        }
        catch(err) {
            vApp.log.debug(err);
            return res.status(401).json({ error: 'Token expired or invalid' });
        }

        return next();        
    }

    verifyCredential(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.ojApi.defaultApiKey, {}, (err, credential) => {
                if (err) {
                    vApp.log.error(err);
                    reject(err);
                }
                else {
                    console.log("======= token ======");
                    if(credential.username == config.ojApi.username &&
                       credential.password == config.ojApi.password)
                    resolve(credential);
                    else 
                        reject(new Error("User Credential are not matched"));
                }
            });
        });
    }

}
module.exports = JWTService;
